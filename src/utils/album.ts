export async function getAlbumImages(albumId: string) {
	// List all album files from collections path
	let images = import.meta.glob<{ default: ImageMetadata }>(
		"/src/content/album/**/*.{jpeg,jpg,png}",
	);

	// Filter images by albumId
	images = Object.fromEntries(Object.entries(images).filter(([key]) => key.includes(albumId)));

	// Images are promises, so we need to resolve the glob promises
	const resolvedImages = await Promise.all(
		Object.values(images).map((image) => image().then((mod) => mod.default)),
	);

	// Shuffle images in random order
	resolvedImages.sort(() => Math.random() - 0.5);
	return resolvedImages;
}
