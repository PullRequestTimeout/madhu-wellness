// Shared by ContactPanel, Footer and the Book buttons
const address = "2070 Washington St, Rossland, BC V0G 1Y0";

export const contact = {
	address,
	mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
	email: "madhucollective01@gmail.com",
	phone: "(250) 362-0021",
	phoneHref: "tel:+12503620021",
	instagramHref: "https://www.instagram.com/madhucollective/",
	facebookHref: "https://www.facebook.com/madhucollective/",
	// Jane, for treatment appointments. Classes and events book through each calendar event's own link
	bookingHref: "https://madhucollective.janeapp.com/"
};
