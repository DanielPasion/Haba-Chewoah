export type TitleToken =
  | { kind: "ink"; text: string }
  | { kind: "muted"; text: string }
  | { kind: "highlight"; text: string }
  | { kind: "pink"; text: string }
  | { kind: "br" };

export const ROTATING_TITLES: TitleToken[][] = [
  [
    { kind: "ink", text: "share & track your" },
    { kind: "br" },
    { kind: "ink", text: "habits" },
    { kind: "muted", text: " until they’re" },
    { kind: "br" },
    { kind: "highlight", text: "habitual" },
    { kind: "ink", text: "." },
  ],
  [
    { kind: "ink", text: "cause " },
    { kind: "pink", text: "“i betcha won’t”" },
    { kind: "br" },
    { kind: "muted", text: "ever have to use" },
    { kind: "br" },
    { kind: "ink", text: "another habit tracker" },
    { kind: "muted", text: " again" },
    { kind: "ink", text: "." },
  ],
];
