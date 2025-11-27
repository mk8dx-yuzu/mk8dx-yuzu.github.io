export function useColor() {
    
	function getColor(mmr, rank = null) {
		if (mmr < 2) {
			return "rank10wood";
		} else if (mmr >= 2 && mmr <= 1499) {
			return "rank09bronze";
		} else if (mmr >= 1500 && mmr <= 2999) {
			return "rank08silver";
		} else if (mmr >= 3000 && mmr <= 5099) {
			return "rank07gold";
		} else if (mmr >= 5100 && mmr <= 6999) {
			return "rank06platinum";
		} else if (mmr >= 7000 && mmr <= 9499) {
			return "rank03diamond";
		} else if (mmr >= 9500) {
			if (rank == 0) return "rank01grandmaster"
			return "rank02master";
		}
	}

	return {
		getColor,
	};
}
