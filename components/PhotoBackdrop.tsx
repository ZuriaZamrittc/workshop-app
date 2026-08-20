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
        // Anchored left so the car stays in frame at any viewport width,
        // matching the sample's composition.
        className="-z-10 object-cover object-left"
      />
      {/* Gradient rather than a flat wash: light over the car on the left so
          it reads as a photo, deepening to the right so the darker panel
          behind the card matches the sample. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/30 via-black/45 to-black/70"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
