import { experimental_AstroContainer } from "astro/container";
import { getContainerRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";
import { render, type CollectionEntry } from "astro:content";

export async function entryToString(
	entry: CollectionEntry<"docs">,
	locals: any,
) {
	if (entry.rendered?.html) {
		return entry.rendered.html;
	}

	const renderers = await loadRenderers([getContainerRenderer()]);
	const container = await experimental_AstroContainer.create({
		renderers,
	});

	const { Content } = await render(entry);

	try {
		const html = await container.renderToString(Content, {
			params: { slug: entry.id },
			locals,
		});

		return html;
	} catch (error) {
		// Getting MDX and React renderers to play nice is a bit tricky, so we're
		// ignoring errors that are likely to be due to React components.
		// This might be fixed and/or easier to address in Astro 5
		if (isErrorWithTitle(error) && error.title !== "NoMatchingRenderer") {
			console.error("There was an error rendering the entry: " + entry.slug);
			console.error(error);
		}
		return undefined;
	}
}

function isErrorWithTitle(error: unknown): error is { title: string } {
	return typeof error === "object" && error !== null && "title" in error;
}
