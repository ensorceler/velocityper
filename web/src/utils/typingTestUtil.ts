export const calculateWPM = (typedEntries: number, timeInSeconds: number) => {
    if (timeInSeconds <= 0) {
        throw new Error("Time must be greater than zero.");
    }

    // Calculate WPM
    const timeInMinutes = timeInSeconds / 60;
    const wpm = typedEntries / 5 / timeInMinutes;

    return parseFloat(wpm.toFixed(2));
};

export const calculateAccuracy = (
    typedEntries: number,
    correctlyTypedEntries: number
) => {
    if (typedEntries === 0) {
        return 0; // or you could throw an error or return null
    }
    const accuracy = (correctlyTypedEntries / typedEntries) * 100;
    return parseFloat(accuracy.toFixed(2)); // returns accuracy rounded to two decimal places
};

const shuffleWordsWithSeed = (array: string[]) => {
    const seed = 12345; // Fixed seed value for reproducibility
    let shuffledArray = array.slice(); // Create a copy of the original array

    for (let i = shuffledArray.length - 1; i > 0; i--) {
        // Generate a pseudo-random index based on the current index and seed
        const randomIndex = Math.floor(((Math.sin(seed + i) + 1) / 2) * (i + 1)); // Normalize sin output to [0, 1] range
        //const randomIndex = Math.floor((Math.sin(seed + i) * 10000) % (i + 1));
        // Swap the current element with the element at the random index
        [shuffledArray[i], shuffledArray[randomIndex]] = [
            shuffledArray[randomIndex],
            shuffledArray[i],
        ];
    }
    return shuffledArray; // Return the shuffled array
};

//  Fisher-Yates (or Knuth) shuffle algorithm

const shuffleWords = (array: string[]) => {
    // Create a copy of the original array to avoid mutating it
    const shuffledArray = array.slice();

    // Loop through the array from the last element to the second element
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        // Generate a random index between 0 and i (inclusive)
        const randomIndex = Math.floor(Math.random() * (i + 1));

        // Swap the current element with the element at the random index
        [shuffledArray[i], shuffledArray[randomIndex]] = [
            shuffledArray[randomIndex],
            shuffledArray[i],
        ];
    }

    return shuffledArray; // Return the shuffled array
};

// Example usage:
const getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const prepareWordState = (
    array: string[],
    includeCharacters: Array<"numbers" | "punctuation">
) => {
    //console.log("shuffle words", shuffleWords(array).slice(0, 100));
    return shuffleWords(array)
        .slice(0, 100)
        .map((word) => modifyWord(word, includeCharacters))
        .map((word, index) => ({
            i: index,
            highlighted: index === 0 ? true : false,
            word: word,
            right: false,
            wrong: false,
        }));
};

export const prepareQuoteState = (quotesData: any[], quoteLength: string, quoteID: number | undefined) => {
    //console.log("quotesData =>", quotesData);
    let quote = "A quick brown fox...";
    let randIdx = 0;
    //console.log('prepare quote state --->',quotesData,quote,quoteID);
    if (quoteID) {
        console.log('quote id set =>', quoteID);
        quote = quotesData?.[quoteID]?.quote;
    } else {
        console.log('quote id not set=>', quoteID);
        switch (quoteLength) {
            case "short":
                randIdx = getRandomNumber(0, 50);
                quote = quotesData?.[randIdx]?.quote;
                console.log("randIdx ", randIdx);
                break;
            case "medium":
                randIdx = getRandomNumber(51, 100);
                quote = quotesData?.[randIdx]?.quote;
                console.log("randIdx ", randIdx);
                break;
            case "long":
                randIdx = getRandomNumber(101, 150);
                quote = quotesData?.[randIdx]?.quote;
                console.log("randIdx ", randIdx);
                break;
        }
    }
    //const quote = quotesData?.[0]?.quote;
    console.log('quote set=>', quote)
    return quote.split(" ").map((word: any, index: number) => ({
        i: index,
        highlighted: index === 0,
        word: word,
        right: false,
        wrong: false,
    }));
};

const modifyWord = (
    word: string,
    typeArr: Array<"numbers" | "punctuation">,
    maxAdditions: number = 1
) => {
    let modifiedWord = word;
    const specialChars = ["!", "@", "#", "$", "%", "^", "&", "*"];

    if (typeArr.includes("punctuation")) {
        const specialCount = Math.floor(Math.random() * (maxAdditions + 1));
        for (let i = 0; i < specialCount; i++) {
            const placement = Math.floor(Math.random() * 3);
            const char =
                specialChars[Math.floor(Math.random() * specialChars.length)];

            switch (placement) {
                case 0: // Before word
                    modifiedWord = char + modifiedWord;
                    break;
                case 1: // After word
                    modifiedWord += char;
                    break;
                case 2: // Inside word
                    const charIndex = Math.floor(Math.random() * modifiedWord.length);
                    modifiedWord =
                        modifiedWord.slice(0, charIndex) +
                        char +
                        modifiedWord.slice(charIndex);
                    break;
            }
        }
    }

    if (typeArr.includes("numbers")) {
        const numberCount = Math.floor(Math.random() * (maxAdditions + 1));
        for (let i = 0; i < numberCount; i++) {
            const placement = Math.floor(Math.random() * 3);
            const num = Math.floor(Math.random() * 10);

            switch (placement) {
                case 0: // Before word
                    modifiedWord = num + modifiedWord;
                    break;
                case 1: // After word
                    modifiedWord += num;
                    break;
                case 2: // Inside word
                    const numIndex = Math.floor(Math.random() * modifiedWord.length);
                    modifiedWord =
                        modifiedWord.slice(0, numIndex) +
                        num +
                        modifiedWord.slice(numIndex);
                    break;
            }
        }
    }

    return modifiedWord;
};
