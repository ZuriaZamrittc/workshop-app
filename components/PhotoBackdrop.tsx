import Image from "next/image";

/** Full-bleed showroom photo with a darkening scrim, for content to sit on.
 *
 *  The image is decorative, so alt is deliberately empty — a screen reader
 *  should skip it rather than announce a filename.
 *
 *  The scrim is not optional: the photo is dark on the right but bright
 *  around the headlights and floor, so without it, white text over the
 *  left-hand side would be unreadable. */
export default function PhotoBackdrop({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative isolate overflow-hidden bg-gray-900 ${className}`}>
      <Image
        src="/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/55" aria-hidden="true" />
      {children}
    </div>
  );
}
