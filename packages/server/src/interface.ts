export enum MessageType {
  OFFER = 'OFFER',
  CANDIDATE = 'CANDIDATE',
}

interface Offer {
  id: number;
}

interface Candidate {
  name: string;
}

export abstract class ConnectionFactoryInterface {
  public abstract sendMessage: <T extends keyof typeof MessageType>({
    // eslint-disable-next-line no-unused-vars
    type,
    // eslint-disable-next-line no-unused-vars
    data,
  }: {
    type: T;
    data: T extends MessageType.OFFER ? Offer : Candidate;
  }) => 1 | 0;
}
