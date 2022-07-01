import { Stream } from '../types';
export declare const useConnection: ({ id, roomId, }: {
    id: number | string;
    roomId: number | string | null;
}) => {
    streams: Stream[];
    lenght: number;
    lostStreamHandler: ({ target, connId }: {
        target: number | string;
        connId: string;
    }) => void;
    screenShare: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    shareScreen: boolean;
    muted: boolean;
    changeMuted: () => void;
    muteds: string[];
    video: boolean;
    changeVideo: () => void;
};
export declare const useVideoDimensions: ({ lenght, container, }: {
    lenght: number;
    container: HTMLDivElement | null;
}) => (e: React.SyntheticEvent<HTMLVideoElement, Event>, stream: MediaStream) => void;
export declare const useOnclickClose: ({ lenght, container }: {
    lenght: number;
    container: HTMLDivElement | null;
}) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
export declare const usePressEscape: () => (e: React.KeyboardEvent<HTMLDivElement>) => void;
