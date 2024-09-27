import { type CollectionEntry, getCollection } from "astro:content";
import { siteConfig } from "@/site-config";

export function groupProjectsByYear(projects: CollectionEntry<"project">[]) {
	return projects.reduce<Record<string, CollectionEntry<"project">[]>>((acc, project) => {
		const year = getProjectSortDate(project).getFullYear();
		if (!acc[year]) {
			acc[year] = [];
		}
		acc[year]?.push(project);
		return acc;
	}, {});
}

/** returns the date of the post based on option in siteConfig.sortPostsByUpdatedDate */
export function getProjectSortDate(project: CollectionEntry<"project">) {
	return siteConfig.sortPostsByUpdatedDate && project.data.updatedDate !== undefined
		? new Date(project.data.updatedDate)
		: new Date(project.data.publishDate);
}

/** filter out draft posts based on the environment */
export async function getAllProjects() {
	return await getCollection("project", ({ data }) => {
		return import.meta.env.PROD ? !data.draft : true;
	});
}

/** sort post by date (by siteConfig.sortPostsByUpdatedDate), desc.*/
export function sortMDByDate(posts: CollectionEntry<"project">[]) {
	return posts.sort((a, b) => {
		const aDate = getProjectSortDate(a).valueOf();
		const bDate = getProjectSortDate(b).valueOf();
		return bDate - aDate;
	});
}

/** returns all tags created from posts (inc duplicate tags)
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getAllTags(projects: CollectionEntry<"project">[]) {
	return projects.flatMap((project) => [...project.data.tags]);
}

/** returns all unique tags created from posts
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTags(projects: CollectionEntry<"project">[]) {
	return [...new Set(getAllTags(projects))];
}

/** returns a count of each unique tag - [[tagName, count], ...]
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTagsWithCount(projects: CollectionEntry<"project">[]): [string, number][] {
	return [
		...getAllTags(projects).reduce(
			(acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}
