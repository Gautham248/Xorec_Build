import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode;
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean;
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}





// import { ComponentPropsWithoutRef, useRef, useState, useEffect } from "react";

// // Utility function to conditionally join classNames
// const cn = (...classes: (string | boolean | undefined)[]) => {
//   return classes.filter(Boolean).join(" ");
// };

// interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
//   /**
//    * Optional CSS class name to apply custom styles
//    */
//   className?: string;
//   /**
//    * Whether to reverse the animation direction
//    * @default false
//    */
//   reverse?: boolean;
//   /**
//    * Whether to pause the animation on hover
//    * @default false
//    */
//   pauseOnHover?: boolean;
//   /**
//    * Content to be displayed in the marquee
//    */
//   children: React.ReactNode;
//   /**
//    * Whether to animate vertically instead of horizontally
//    * @default false
//    */
//   vertical?: boolean;
//   /**
//    * Number of times to repeat the content
//    * @default 4
//    */
//   repeat?: number;
//   /**
//    * Whether to enable horizontal scrolling
//    * @default false
//    */
//   scrollable?: boolean;
//   /**
//    * Speed of manual scrolling (pixels per wheel event)
//    * @default 100
//    */
//   scrollSpeed?: number;
// }

// export function Marquee({
//   className,
//   reverse = false,
//   pauseOnHover = false,
//   children,
//   vertical = false,
//   repeat = 4,
//   scrollable = false,
//   scrollSpeed = 100,
//   ...props
// }: MarqueeProps) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [isScrolling, setIsScrolling] = useState(false);
//   const [pauseAnimation, setPauseAnimation] = useState(false);
  
//   // Handle wheel events for horizontal scrolling
//   useEffect(() => {
//     if (!scrollable || !containerRef.current) return;
    
//     const container = containerRef.current;
    
//     const handleWheel = (e: WheelEvent) => {
//       if (!container) return;
      
//       // Prevent default to disable vertical scrolling
//       e.preventDefault();
      
//       // Calculate scroll amount based on delta
//       const scrollAmount = e.deltaY * (reverse ? -1 : 1);
//       container.scrollLeft += scrollAmount / 2;
      
//       // Pause animation while manually scrolling
//       if (!isScrolling) {
//         setIsScrolling(true);
//         setPauseAnimation(true);
//       }
      
//       // Reset scrolling state after a delay
//       clearTimeout(container.dataset.scrollTimeout as any);
//       container.dataset.scrollTimeout = setTimeout(() => {
//         setIsScrolling(false);
//         setPauseAnimation(false);
//       }, 200) as any;
//     };
    
//     container.addEventListener('wheel', handleWheel, { passive: false });
    
//     return () => {
//       container.removeEventListener('wheel', handleWheel);
//     };
//   }, [scrollable, reverse, isScrolling]);
  
//   return (
//     <div
//       ref={containerRef}
//       className={cn(
//         "flex w-full overflow-hidden",
//         vertical ? "flex-col" : "flex-row",
//         scrollable && "overflow-x-scroll scrollbar-hide",
//         className
//       )}
//       onMouseEnter={() => pauseOnHover && setPauseAnimation(true)}
//       onMouseLeave={() => setPauseAnimation(false)}
//       {...props}
//     >
//       {/* <div
//         className={cn(
//           "flex shrink-0 items-center",
//           vertical ? "flex-col" : "flex-row",
//           vertical
//             ? "animate-marquee-vertical"
//             : reverse
//             ? "animate-marquee-reverse"
//             : "animate-marquee",
//           (pauseAnimation || isScrolling) && "animation-play-state-paused"
//         )}
//       > */}
//       <div
//   className={cn(
//     "flex shrink-0 items-center",
//     vertical ? "flex-col" : "flex-row",
//     vertical
//       ? "animate-marquee-vertical"
//       : reverse
//       ? "animate-marquee-reverse"
//       : "animate-marquee",
//     (pauseAnimation || isScrolling) && "animation-play-state-paused"
//   )}
//   style={{ ["--repeat-count" as any]: repeat }}
// >

//         {Array(repeat)
//           .fill(0)
//           .map((_, i) => (
//             <div
//               key={i}
//               className={cn(
//                 "flex shrink-0 items-center",
//                 vertical ? "flex-col" : "flex-row"
//               )}
//             >
//               {children}
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// }