export function parseQuestions(text) {
  console.log("Parsing text:", text);
  const blocks = text.trim().split(/Question:\s*/).slice(1);
  console.log("Blocks:", blocks);

  return blocks.map((block, blockIndex) => {
    const qMatch = block.match(/^(.*?)\n/);
    const q = qMatch ? qMatch[1] : '';
    console.log(`Question ${blockIndex + 1}:`, q);

    // Extract the options section - try different formats
    let optionsLine = '';
    let optionsArray = [];

    // Format 1: Options on separate lines after "Options:" label
    const optionsBlockMatch = block.match(/Options:\s*\n((?:[a-e]\).*\n?)+)(?=\nAnswer:|$)/s);
    if (optionsBlockMatch) {
      optionsLine = optionsBlockMatch[1].trim();
      console.log("Found options format 1 (separate lines):", optionsLine);

      // Parse each line as an option
      optionsArray = optionsLine.split('\n')
        .map(line => {
          const lineMatch = line.match(/^[a-e]\)\s*(.*)/);
          return lineMatch ? lineMatch[1].trim() : null;
        })
        .filter(Boolean);
    }

    // Format 2: Options on a single line after "Options:" label
    if (optionsArray.length === 0) {
      const optionsLineMatch = block.match(/Options:\s*((?:[a-e]\).*?(?=\s+[a-e]\)|$))+)/s);
      if (optionsLineMatch) {
        optionsLine = optionsLineMatch[1].trim();
        console.log("Found options format 2 (single line):", optionsLine);

        // Parse options from the single line
        const optionRegex = /([a-e])\)\s*([^a-e)]+?)(?=\s+[a-e]\)|$)/g;
        let match;
        while ((match = optionRegex.exec(optionsLine)) !== null) {
          optionsArray.push(match[2].trim());
        }
      }
    }

    // Format 3: Options directly in the text without "Options:" label
    if (optionsArray.length === 0) {
      const optionsSection = block.match(/(?:^|\n)([a-e]\).*(?:\n[a-e]\).*){0,4})(?=\nAnswer:|$)/s);
      if (optionsSection) {
        optionsLine = optionsSection[1].trim();
        console.log("Found options format 3 (direct options):", optionsLine);

        // Parse each line as an option
        optionsArray = optionsLine.split('\n')
          .map(line => {
            const lineMatch = line.match(/^[a-e]\)\s*(.*)/);
            return lineMatch ? lineMatch[1].trim() : null;
          })
          .filter(Boolean);
      }
    }

    // Fallback: if still no options, create default ones
    if (optionsArray.length === 0) {
      console.warn(`Could not parse options for question ${blockIndex + 1}, using defaults`);
      optionsArray = ["Option A", "Option B", "Option C", "Option D", "Option E"];
    }

    // Ensure we have exactly 5 options
    while (optionsArray.length < 5) {
      optionsArray.push(`Option ${String.fromCharCode(65 + optionsArray.length)}`);
    }

    // Trim to 5 options if we have more
    optionsArray = optionsArray.slice(0, 5);

    console.log(`Parsed options for question ${blockIndex + 1}:`, optionsArray);

    // Extract answer and explanation
    const aMatch = block.match(/Answer:\s*(.*?)(?=\n|$)/);
    const eMatch = block.match(/Explanation:\s*(.*?)(?=\n\n|$)/s);

    console.log(`Answer match for question ${blockIndex + 1}:`, aMatch);

    // Extract the answer
    let answer = '';
    if (aMatch) {
      const answerFull = aMatch[1].trim();
      // Try to extract the letter
      const answerLetter = answerFull.match(/^([a-e])\)/);

      if (answerLetter) {
        const letterIndex = 'abcde'.indexOf(answerLetter[1]);
        if (letterIndex >= 0 && letterIndex < optionsArray.length) {
          answer = optionsArray[letterIndex];
        } else {
          answer = answerFull;
        }
      } else {
        answer = answerFull;
      }
    }

    console.log(`Final answer for question ${blockIndex + 1}:`, answer);

    return {
      question: q.trim(),
      options: optionsArray,
      answer,
      explanation: eMatch ? eMatch[1].trim() : ''
    };
  }).filter(q => q.question && q.options.length > 0); // Filter out any invalid questions
}