<template>
    <div>
        <canvas id="pieChart"></canvas>
    </div>
</template>

<script>
import { Chart, registerables } from "chart.js";

export default {
    props: {
        pieChartData: {
            type: Object,
            required: true,
            default: () => ({})
        }
    },

    mounted() {
        const ctx = document.getElementById("pieChart");
        Chart.register(...registerables);
        new Chart(ctx, this.pieChartData);
    },
};
</script>
