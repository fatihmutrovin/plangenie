function calculateRiskProfile(data){

    let score = 0;

    // AGE

    switch(data.age){

        case "under_20":
            score += 2;
            break;

        case "20_25":
            score += 2;
            break;

        case "26_30":
            score += 1;
            break;

        case "31_40":
            score += 0;
            break;

        case "over_40":
            score += 0;
            break;

    }

    // INVESTMENT

    switch(data.investmentExperience){

        case "Belum":
            score += 0;
            break;

        case "Pernah":
            score += 1;
            break;

        case "Rutin":
            score += 2;
            break;

    }

    // SAVING HABIT

    switch(data.savingHabit){

        case "Tidak_pernah":
        case "tidak_pernah":
            score -= 1;
            break;

        case "Kadang":
        case "kadang":
            score += 1;
            break;

        case "Rutin":
        case "rutin":
            score += 2;
            break;

    }

    // LIFESTYLE

    switch(data.lifestyle){

        case "Konsumtif":
        case "konsumtif":
            score -= 2;
            break;

        case "Normal":
        case "normal":
            score += 1;
            break;

        case "Hemat":
        case "hemat":
            score += 2;
            break;

    }

    // MARITAL STATUS

    switch(data.maritalStatus){

        case "single":
            score += 0;
            break;

        case "menikah_tanpa_anak":
            score += 0;
            break;

        case "menikah_memiliki_anak":
            score -= 1;
            break;

    }

    // EXPENSE %

    switch(data.expensePercentage){

        case "over_90":
            score -= 2;
            break;

        case "70_90":
            score -= 1;
            break;

        case "50_70":
            score += 1;
            break;

        case "under_50":
            score += 1;
            break;

    }

    let profile = "";

    if(score <= 0){

        profile = "Konservatif";

    }
    else if(score <= 4){

        profile = "Moderat";

    }
    else{

        profile = "Agresif";

    }

    return {
        score,
        profile
    };

}

module.exports = {
    calculateRiskProfile
};