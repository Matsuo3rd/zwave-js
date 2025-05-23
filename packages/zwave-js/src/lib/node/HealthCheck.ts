import { Powerlevel } from "@zwave-js/cc";
import { getEnumMemberName } from "@zwave-js/shared";
import type {
	LifelineHealthCheckResult,
	LifelineHealthCheckSummary,
	RouteHealthCheckResult,
	RouteHealthCheckSummary,
} from "./_Types.js";

export const healthCheckTestFrameCount = 10;

export function healthCheckRatingToWord(rating: number): string {
	return rating >= 10
		? "perfect"
		: rating >= 6
		? "good"
		: rating >= 4
		? "acceptable"
		: rating >= 1
		? "bad"
		: "dead";
}

export function formatLifelineHealthCheckRound(
	round: number,
	numRounds: number,
	result: LifelineHealthCheckResult,
): string {
	const ret = [
		`· round ${
			round.toString().padStart(
				Math.floor(Math.log10(numRounds) + 1),
				" ",
			)
		} - rating: ${result.rating} (${
			healthCheckRatingToWord(
				result.rating,
			)
		})`,
		`  failed pings → node:             ${result.failedPingsNode}/${healthCheckTestFrameCount}`,
		`  max. latency:                    ${result.latency.toFixed(1)} ms`,
		result.routeChanges != undefined
			? `  route changes:                   ${result.routeChanges}`
			: "",
		result.snrMargin != undefined
			? `  SNR margin:                      ${result.snrMargin} dBm`
			: "",
		result.failedPingsController != undefined
			? `  failed pings → controller:       ${result.failedPingsController}/${healthCheckTestFrameCount} at normal power`
			: result.minPowerlevel != undefined
			? `  min. node powerlevel w/o errors: ${
				getEnumMemberName(
					Powerlevel,
					result.minPowerlevel,
				)
			}`
			: "",
	]
		.filter((line) => !!line)
		.join("\n");
	return ret;
}

export function formatLifelineHealthCheckSummary(
	summary: LifelineHealthCheckSummary,
): string {
	let ret = `
rating:                   ${summary.rating} (${
		healthCheckRatingToWord(
			summary.rating,
		)
	})`;
	const numNeighbors = summary.results.at(-1)!.numNeighbors;
	if (numNeighbors != undefined) {
		ret += `
no. of routing neighbors: ${summary.results.at(-1)!.numNeighbors}`;
	}

	ret += `

Check rounds:
${
		summary.results
			.map((r, i) =>
				formatLifelineHealthCheckRound(i + 1, summary.results.length, r)
			)
			.join("\n \n")
	}`;

	return ret.trim();
}

export function formatRouteHealthCheckRound(
	sourceNodeId: number,
	targetNodeId: number,
	round: number,
	numRounds: number,
	result: RouteHealthCheckResult,
): string {
	const ret = [
		`· round ${
			round.toString().padStart(
				Math.floor(Math.log10(numRounds) + 1),
				" ",
			)
		} - rating: ${result.rating} (${
			healthCheckRatingToWord(
				result.rating,
			)
		})`,
		result.failedPingsToTarget != undefined
			? `  failed pings ${sourceNodeId} → ${targetNodeId}:      ${result.failedPingsToTarget}/${healthCheckTestFrameCount}`
			: result.minPowerlevelSource != undefined
			? `  Node ${sourceNodeId} min. powerlevel w/o errors: ${
				getEnumMemberName(
					Powerlevel,
					result.minPowerlevelSource,
				)
			}`
			: "",
		result.failedPingsToSource != undefined
			? `  failed pings ${targetNodeId} → ${sourceNodeId}:      ${result.failedPingsToSource}/${healthCheckTestFrameCount}`
			: result.minPowerlevelTarget != undefined
			? `  Node ${targetNodeId} min. powerlevel w/o errors: ${
				getEnumMemberName(
					Powerlevel,
					result.minPowerlevelTarget,
				)
			}`
			: "",
	]
		.filter((line) => !!line)
		.join("\n");
	return ret;
}

export function formatRouteHealthCheckSummary(
	sourceNodeId: number,
	targetNodeId: number,
	summary: RouteHealthCheckSummary,
): string {
	let ret = `
rating:                   ${summary.rating} (${
		healthCheckRatingToWord(
			summary.rating,
		)
	})`;
	const numNeighbors = summary.results.at(-1)!.numNeighbors;
	if (numNeighbors != undefined) {
		ret += `
no. of routing neighbors: ${summary.results.at(-1)!.numNeighbors}`;
	}

	ret += `

Check rounds:
${
		summary.results
			.map((r, i) =>
				formatRouteHealthCheckRound(
					sourceNodeId,
					targetNodeId,
					i + 1,
					summary.results.length,
					r,
				)
			)
			.join("\n \n")
	}`;

	return ret.trim();
}
