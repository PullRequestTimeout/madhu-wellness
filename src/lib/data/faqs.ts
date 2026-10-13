export type FaqAnswer =
	{ element: "p"; content: string } | { element: "ul"; content: string[] } | { element: "a"; content: { href: string; text: string } };

export type Faq = { question: string; answer: FaqAnswer[] };

export const homeFaqs: Faq[] = [
	{
		question: "Placeholder question?",
		answer: [{ element: "p", content: "Placeholder answer." }]
	}
];
