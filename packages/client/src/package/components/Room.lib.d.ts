export declare const getRoomLink: (roomId: number | string | null) => string | null;
export declare const getPathname: () => string | null;
export declare const getWidthOfItem: ({ lenght, container, coeff, }: {
    lenght: number;
    container: HTMLDivElement;
    coeff: number;
}) => {
    width: number;
    cols: number;
    rows: number;
};
export declare const onClickVideo: (e: React.MouseEvent<HTMLVideoElement, MouseEvent>) => void;
export declare const copyLink: (link: string) => void;
export declare const supportDisplayMedia: () => boolean;
