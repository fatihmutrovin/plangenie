function generateRecommendations(data, result){

    const recommendations = [];

    // SAVING RATE

    if(result.savingRate.condition === "Rendah"){

        recommendations.push(
            "Kurangi pengeluaran bulanan minimal 10%"
        );

    }

    // SAVING AMOUNT

    if(data.savingAmount === "Belum_punya"){

        recommendations.push(
            "Bangun dana darurat 3–6 bulan pengeluaran"
        );

    }

    // INVESTMENT

    if(

        data.investmentExperience === "Belum" ||
        data.investmentExperience === "Pernah"

    ){

        recommendations.push(
            "Mulai investasi otomatis bulanan"
        );

    }

    // LIFESTYLE

    if(data.lifestyle === "Konsumtif"){

        recommendations.push(
            "Batasi pengeluaran non-prioritas"
        );

    }

    // EXPENSE RECORDING

    if(

        data.expenseRecording === "kadang" ||
        data.expenseRecording === "Tidak_pernah"

    ){

        recommendations.push(
            "Mulai budgeting dan pencatatan keuangan"
        );

    }

    // EXPENSE %

    if(data.expensePercentage === "over_90"){

        recommendations.push(
            "Evaluasi ulang cashflow bulanan"
        );

    }

    // FAMILY

    if(

        data.maritalStatus ===
        "menikah_memiliki_anak"

    ){

        recommendations.push(
            "Prioritaskan proteksi dan dana darurat"
        );

    }

    // RISK PROFILE

    if(
        result.riskProfile.profile ===
        "Konservatif"
    ){

        recommendations.push(
            "Fokus pada instrumen stabil dan rendah risiko"
        );

    }

    if(
        result.riskProfile.profile ===
        "Moderat"
    ){

        recommendations.push(
            "Gunakan kombinasi growth dan stability"
        );

    }

    if(
        result.riskProfile.profile ===
        "Agresif"
    ){

        recommendations.push(
            "Mulai mempertimbangkan instrumen growth tinggi"
        );

    }

    return [...new Set(recommendations)];

}

module.exports = {
    generateRecommendations
};