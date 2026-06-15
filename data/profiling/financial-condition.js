function calculateFinancialCondition(
    data,
    savingRate
){

    let score = 0;

    // SAVING RATE

    switch(savingRate){

        case "Rendah":
            score -= 2;
            break;

        case "Cukup":
            score += 1;
            break;

        case "Baik":
            score += 2;
            break;

        case "Sangat Baik":
            score += 3;
            break;

    }

    // EXPENSE %

    switch(data.expensePercentage){

        case "over_90":
            score -= 3;
            break;

        case "70_90":
            score -= 1;
            break;

        case "50_70":
            score += 1;
            break;

        case "under_50":
            score += 2;
            break;

    }

    // SAVING AMOUNT

    switch(data.savingAmount){

        case "Belum_punya":
            score -= 2;
            break;

        case "under_5juta":
            score += 0;
            break;

        case "5_20juta":
            score += 1;
            break;

        case "20_50juta":
        case "over_50juta":
            score += 2;
            break;

    }

    // SAVING HABIT

    switch(data.savingHabit){

        case "Tidak_pernah":
        case "tidak_pernah":
            score -= 2;
            break;

        case "Kadang":
        case "kadang":
            score += 0;
            break;

        case "Rutin":
        case "rutin":
            score += 2;
            break;

    }

    // EXPENSE FOCUS

    switch(data.expenseFocus){

        case "Cicilan_utang":
        case "Cicilan / utang":
            score -= 2;
            break;

        case "Gaya_hidup":
            score -= 1;
            break;

        case "Kebutuhan_pokok":
            score += 1;
            break;

    }

    // MARITAL STATUS

    switch(data.maritalStatus){

        case "single":
            score += 1;
            break;

        case "menikah_tanpa_anak":
            score += 0;
            break;

        case "menikah_memiliki_anak":
            score -= 1;
            break;

    }

    let condition = "";

    if(score <= -3){

        condition = "Tidak Stabil";

    }
    else if(score <= 2){

        condition = "Cukup Stabil";

    }
    else if(score <= 6){

        condition = "Stabil";

    }
    else{

        condition = "Sangat Stabil";

    }

    return {

        score,
        condition

    };

}

module.exports = {
    calculateFinancialCondition
};