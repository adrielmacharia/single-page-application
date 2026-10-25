
        // DOM Elements
        const searchForm = document.getElementById('search-form');
        const wordInput = document.getElementById('word-input');
        const resultsSection = document.getElementById('results-section');
        const errorMessage = document.getElementById('error-message');
        const displayWord = document.getElementById('display-word');
        const pronunciation = document.getElementById('pronunciation');
        const audioPlayer = document.getElementById('audio-player');
        const definitionsContainer = document.getElementById('definitions-container');
        const displaySynonyms = document.getElementById('display-synonyms');

        // Event Listener for Form Submission
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const word = wordInput.value.trim();
            if (word) {
                fetchWordData(word);
            }
        });

        // Function 1: Fetching data from the API
        async function fetchWordData(word) {
            // Clear previous results and errors
            errorMessage.style.display = 'none';
            resultsSection.style.display = 'none';
            definitionsContainer.innerHTML = '';
            displaySynonyms.textContent = '';

            const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

            try {
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    throw new Error(`No definitions found for "${word}". Please try another word.`);
                }

                const data = await response.json();
                
                // Function 2: Parsing and displaying the data
                displayWordData(data[0]);

                // Clear input field on success
                wordInput.value = '';

            } catch (error) {
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
            }
        }

        // Function 2: Parsing and displaying the data
        function displayWordData(data) {
            // 1. Display Word
            displayWord.textContent = data.word;

            // 2. Display Pronunciation
            const phonetic = data.phonetic || (data.phonetics.length > 0 ? data.phonetics[0].text : '');
            pronunciation.textContent = phonetic;

            // 3. Handle Audio Playback
            // Find the first phonetic object that has an audio link
            const audioObj = data.phonetics.find(p => p.audio !== '');
            if (audioObj && audioObj.audio) {
                audioPlayer.src = audioObj.audio;
                audioPlayer.style.display = 'block'; // Show the player
            } else {
                audioPlayer.style.display = 'none'; // Hide if no audio available
            }

            // 4. Display Definitions
            let allSynonyms = new Set();
            
            data.meanings.forEach(meaning => {
                // Create part of speech heading
                const posHeader = document.createElement('span');
                posHeader.className = 'part-of-speech';
                posHeader.textContent = meaning.partOfSpeech;
                definitionsContainer.appendChild(posHeader);

                // Create list for definitions
                const ul = document.createElement('ul');
                
                // Limit to 3 definitions per part of speech to keep it clean
                meaning.definitions.slice(0, 3).forEach(defObj => {
                    const li = document.createElement('li');
                    li.textContent = defObj.definition;
                    ul.appendChild(li);

                    // Collect synonyms from definitions
                    if (defObj.synonyms) {
                        defObj.synonyms.forEach(syn => allSynonyms.add(syn));
                    }
                });
                
                definitionsContainer.appendChild(ul);

                // Collect synonyms from meaning level
                if (meaning.synonyms) {
                    meaning.synonyms.forEach(syn => allSynonyms.add(syn));
                }
            });

            // 5. Display Synonyms
            const synonymArray = Array.from(allSynonyms);
            if (synonymArray.length > 0) {
                // Show up to 10 synonyms
                displaySynonyms.textContent = synonymArray.slice(0, 10).join(', ');
            } else {
                displaySynonyms.textContent = 'None found.';
            }

            // Show the results section
            resultsSection.style.display = 'block';
        }
