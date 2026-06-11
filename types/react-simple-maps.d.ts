// Minimal ambient types for react-simple-maps v3 (the package ships no types).
declare module "react-simple-maps" {
  import type { ReactNode, SVGProps, CSSProperties } from "react";

  export interface ComposableMapProps extends SVGProps<SVGSVGElement> {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    width?: number;
    height?: number;
  }
  export const ComposableMap: (props: ComposableMapProps) => JSX.Element;

  export interface GeographiesProps {
    geography: string | Record<string, unknown>;
    children: (args: { geographies: GeographyShape[] }) => ReactNode;
  }
  export interface GeographyShape {
    rsmKey: string;
    properties: Record<string, unknown>;
    [key: string]: unknown;
  }
  export const Geographies: (props: GeographiesProps) => JSX.Element;

  export interface GeographyProps extends Omit<SVGProps<SVGPathElement>, "geography" | "style"> {
    geography: GeographyShape;
    style?: {
      default?: CSSProperties;
      hover?: CSSProperties;
      pressed?: CSSProperties;
    };
  }
  export const Geography: (props: GeographyProps) => JSX.Element;

  export interface MarkerProps extends SVGProps<SVGGElement> {
    coordinates: [number, number];
  }
  export const Marker: (props: MarkerProps) => JSX.Element;
}
