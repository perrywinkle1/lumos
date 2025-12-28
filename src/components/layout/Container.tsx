import { cn } from "@/lib/utils";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

interface ContainerProps {
  children: React.ReactNode;
  size?: ContainerSize;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-2xl", // 672px - ideal for reading content
  md: "max-w-4xl", // 896px - articles with some media
  lg: "max-w-6xl", // 1152px - dashboards, wider layouts
  xl: "max-w-7xl", // 1280px - full-width sections
  full: "max-w-full", // no constraint
};

export function Container({
  children,
  size = "xl",
  className,
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Component>
  );
}

// Semantic variants for common use cases
interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ArticleContainer({ children, className }: ContentContainerProps) {
  return (
    <Container size="sm" as="article" className={cn("py-8 md:py-12", className)}>
      {children}
    </Container>
  );
}

export function PageContainer({ children, className }: ContentContainerProps) {
  return (
    <Container size="xl" className={cn("py-8 md:py-12", className)}>
      {children}
    </Container>
  );
}

export function NarrowContainer({ children, className }: ContentContainerProps) {
  return (
    <Container size="md" className={cn("py-8 md:py-12", className)}>
      {children}
    </Container>
  );
}
