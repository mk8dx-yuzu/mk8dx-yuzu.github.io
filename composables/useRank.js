export function useRank() {
    function getRank(mmr) {
		if (mmr < 2) {
			return "Wood";
		} else if (mmr >= 2 && mmr <= 1499) {
			return "Bronze";
		} else if (mmr >= 1500 && mmr <= 2999) {
			return "Silver";
		} else if (mmr >= 3000 && mmr <= 5099) {
			return "Gold";
		} else if (mmr >= 5100 && mmr <= 6999) {
			return "Platinum";
		} else if (mmr >= 7000 && mmr <= 9499) {
			return "Diamond";
		} else if (mmr >= 9500) {
			return "Master";
		}
	}
    return {
        getRank
    }
}