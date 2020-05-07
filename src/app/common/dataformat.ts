
export interface Element  {
//    position: number;
    corporation: string;
    name: string;
    address: string;
    send: boolean;
}

export type MailMessage = {
    from: string;
    replyto?: string;
    to?: string | Array<string>;
    cc?: string | Array<string>;
    bcc?: string | Array<string>;
    subject: string;
    text: string;
    html?: string;
    attachements?: Array<any>;
};
