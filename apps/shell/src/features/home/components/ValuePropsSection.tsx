import { Icon } from "@ecom/ui";
import { VALUE_PROPS } from "@/features/home/data/home-data.ts";

export function ValuePropsSection() {
  return (
    <section
      aria-labelledby="why-title"
      className="max-w-[1280px] mx-auto px-4 sm:px-10 py-10 sm:py-16"
    >
      <h2 id="why-title" className="sr-only">
        Vì sao mua ở đây
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 border-t border-line pt-9">
        {VALUE_PROPS.map((prop) => (
          <div key={prop.id} className="flex gap-4 items-start">
            <div className="size-11 rounded-xl bg-brand-tint flex items-center justify-center shrink-0 text-brand">
              <Icon name={prop.iconName} size={24} />
            </div>

            <div>
              <h3 className="font-sans text-[17px] font-semibold text-ink mb-1.5 leading-snug">
                {prop.title}
              </h3>
              <p className="text-sm sm:text-[14.5px] text-ink-2 leading-relaxed">
                {prop.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
