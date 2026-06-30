import { cn } from "../../utils/cn";

function Card({ title, subtitle, children, actions, className = "" }) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-md border border-gray-200 p-6",
        className
      )}
    >
      {(title || subtitle || actions) && (
        <div className="flex justify-between items-start mb-5">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-gray-800">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>

          {actions && <div>{actions}</div>}
        </div>
      )}

      {children}
    </div>
  );
}

export default Card;