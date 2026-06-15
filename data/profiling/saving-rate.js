function calculateSavingRate(data){
    
    let score = 0;

    // EXPENSE %

    switch(data.expensePercentage){

        case "over_90":
            score += 0;
            break;

        case "70_90":
            score += 1;
            break;

        case "50_70":
            score += 2;
            break;

        case "under_50":
            score += 3;
            break;

    }

    // SAVING HABIT

    switch(data.savingHabit){

        case "Tidak_pernah":
        case "tidak_pernah":
            score += 0;
            break;

        case "Kadang":
        case "kadang":
            score += 1;
            break;

        case "Rutin":
        case "rutin":
            score += 3;
            break;

    }

    // INVESTMENT

    switch(data.investmentExperience){

        case "Belum":
        case "belum":
            score += 0;
            break;

        case "Pernah":
        case "pernah":
            score += 1;
            break;

        case "Rutin":
        case "rutin":
            score += 2;
            break;

    }

    // SAVING AMOUNT

    switch(data.savingAmount){

        case "Belum_punya":
            score += 0;
            break;

        case "under_5juta":
            score += 1;
            break;

        case "5_20juta":
            score += 2;
            break;

        case "20_50juta":
        case "over_50juta":
            score += 3;
            break;

    }

    let condition = "";

    if(score <= 2){

        condition = "Rendah";

    }
    else if(score <= 5){

        condition = "Cukup";

    }
    else if(score <= 8){

        condition = "Baik";

    }
    else{

        condition = "Sangat Baik";

    }

    return {
        score,
        condition
    };

}

module.exports = {
    calculateSavingRate
};