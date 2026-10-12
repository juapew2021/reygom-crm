#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
exec 9>/opt/reygom/deploy-crm-dev.lock
flock -n 9 || { echo 'Another DEV deployment is running'; exit 1; }
exec > >(tee -a /opt/reygom/logs/deploy-crm-dev.log) 2>&1

REPO=/root/src/reygom-crm
git -C "$REPO" fetch origin develop
SHA=$(git -C "$REPO" rev-parse origin/develop)
if [[ -n ${1:-} && $1 != "$SHA" ]]; then
  echo 'Requested commit is no longer develop HEAD; refusing stale deployment'
  exit 1
fi
SHORT=${SHA:0:7}
VERSION=0.5.0-dev-$SHORT
IMAGE=reygom-crm:dev-$SHORT
RUN=/opt/reygom/releases/crm-dev-$SHORT-$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$RUN/source" "$RUN/rollback"
git -C "$REPO" archive "$SHA" | tar -x -C "$RUN/source"
printf '%s\n' "$SHA" > "$RUN/commit.txt"

K=(microk8s kubectl -n reygom-dev)
OLD=$("${K[@]}" get deployment reygom-crm -o jsonpath='{.spec.template.spec.containers[?(@.name=="crm")].image}')
test -n "$OLD"
"${K[@]}" get deployment reygom-crm -o yaml > "$RUN/rollback/deployment.yaml"
printf '%s\n' "$OLD" > "$RUN/rollback/image.txt"
microk8s ctr images export "$RUN/rollback/image.tar" "docker.io/library/$OLD"

docker build --build-arg VITE_SCRAPER_URL=/crawler/search --build-arg VITE_API_URL=https://api-dev.reygom.com \
  --build-arg VITE_APP_VERSION="$VERSION" --build-arg VITE_APP_ENV=DEV \
  -t "$IMAGE" "$RUN/source"
docker run --rm --entrypoint sh "$IMAGE" -c \
  "grep -qF '$VERSION' /usr/share/nginx/html/assets/*.js && grep -qF 'https://api-dev.reygom.com' /usr/share/nginx/html/assets/*.js"
docker save "$IMAGE" -o "$RUN/image.tar"
microk8s ctr images import "$RUN/image.tar"

rollback() {
  status=$?
  trap - ERR
  echo "Deployment failed; restoring $OLD"
  "${K[@]}" set image deployment/reygom-crm "crm=$OLD"
  "${K[@]}" rollout status deployment/reygom-crm --timeout=180s
  exit "$status"
}
trap rollback ERR
"${K[@]}" set image deployment/reygom-crm "crm=$IMAGE"
"${K[@]}" rollout status deployment/reygom-crm --timeout=180s
curl --fail --silent --show-error --retry 3 https://crm-dev.reygom.com/ > "$RUN/index.html"
"${K[@]}" exec deployment/reygom-crm -- sh -c \
  "grep -qF '$VERSION' /usr/share/nginx/html/assets/*.js"
trap - ERR
echo "DEV deployed: $SHA ($VERSION). Rollback: $RUN/rollback"
