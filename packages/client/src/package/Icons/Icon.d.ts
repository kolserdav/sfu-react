/// <reference types="react" />
export interface IconProps {
    children: string;
    color?: string;
}
declare function Icon({ color, children }: IconProps): JSX.Element;
declare namespace Icon {
    var defaultProps: {
        color: string;
    };
}
export default Icon;
