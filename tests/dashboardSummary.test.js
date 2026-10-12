import test from "node:test";
import assert from "node:assert/strict";
import { mergeVisibleProperties } from "../src/services/dashboardSummary.js";

test("admin dashboard follows the visible list rather than a stale organization count", () => {
  const properties = Array.from({ length: 176 }, (_, index) => ({ id: String(index) }));
  const summary = { properties_count: 2, leads_count: 3, pipeline: { Nuevo: 3 }, latest_properties: [{ id: "stale" }] };
  const result = mergeVisibleProperties(summary, properties);
  assert.equal(result.properties_count, 176);
  assert.deepEqual(result.latest_properties, properties.slice(0, 5));
  assert.equal(result.leads_count, 3);
  assert.deepEqual(result.pipeline, summary.pipeline);
  assert.equal(summary.properties_count, 2);
  assert.equal(properties.length, 176);
});

test("agent summary contains only the records returned by the authorized list", () => {
  const properties = [{ id: "agent-visible" }];
  const result = mergeVisibleProperties({ properties_count: 176 }, properties);
  assert.equal(result.properties_count, 1);
  assert.deepEqual(result.latest_properties, properties);
});

test("an empty authorized list gives an empty summary", () => {
  assert.deepEqual(mergeVisibleProperties({}, []), { properties_count: 0, latest_properties: [] });
});

test("an invalid response fails instead of displaying misleading zero totals", () => {
  assert.throws(() => mergeVisibleProperties({}, { message: "error" }), TypeError);
});
