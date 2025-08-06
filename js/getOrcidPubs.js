function includeJS(incFile) {
    document.write('<script type="text/javascript" src="'+ incFile+ '"></script>');
}


function httpOrcidGet(url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
}

async function getPubList(orcid) {
    let link = "https://pub.orcid.org/v2.0/" + orcid + "/works";
    let list = [];
    
    try {
        await httpOrcidGet(link).then(async function (data) {
            data = JSON.parse(data);
            
            for (let i in data.group) {
                let publink = "https://pub.orcid.org/v2.0/" + orcid + "/work/" + data.group[i]["work-summary"][0]["put-code"];
                
                try {
                    let pub = await httpOrcidGet(publink).then(function (pubdetails) {
                        pubdetails = JSON.parse(pubdetails);
                        
                        if (pubdetails["citation"] && pubdetails["citation"]["citation-value"]) {
                            // Create ParseBibtex object and enhance with ORCID metadata
                            let bibtexPub = new ParseBibtex(pubdetails["citation"]["citation-value"]);
                            
                            // Enhance with URL from ORCID external IDs if BibTeX doesn't have one
                            if (!bibtexPub._url && !bibtexPub.url) {
                                const externalId = pubdetails['external-ids']?.['external-id']?.[0];
                                if (externalId && externalId['external-id-url']) {
                                    bibtexPub._url = externalId['external-id-url'].value;
                                }
                            }
                            
                            return bibtexPub;
                        } else {
                            // Use ORCID metadata when BibTeX is not available
                            return createPublicationFromOrcidMetadata(pubdetails);
                        }
                    });
                    
                    if (pub) {
                        list.push(pub);
                    }
                } catch (pubError) {
                    console.warn(`Skipping publication ${i} due to error:`, pubError);
                }
            }
        });
    } catch (error) {
        console.error('Error fetching ORCID data:', error);
        throw error;
    }
    
    return list;
}

function stripPublicationWrapper(content) {
    if (typeof content === 'string') {
        // Create a temporary div to parse the HTML properly
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content.trim();
        
        // Check if the content is wrapped in a publication container
        const wrapper = tempDiv.firstElementChild;
        
        if (wrapper && 
            (wrapper.classList.contains('publication') || 
             wrapper.tagName === 'ARTICLE' && wrapper.classList.contains('publication'))) {
            // Return the innerHTML of the wrapper (unwrapped content)
            return wrapper.innerHTML;
        }
        
        // If no wrapper found, return original content
        return content;
    }
    
    return content;
}

function enhancePublicationContent(content, publication) {
    // Parse the existing content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Check if there's already a link
    const existingLink = tempDiv.querySelector('a[href*="http"]');
    
    if (!existingLink) {
        // Try to find a URL from the publication object
        let url = null;
        
        // Check various possible URL properties
        if (publication._url) {
            url = publication._url;
        } else if (publication.url) {
            url = publication.url;
        } else if (publication._doi && publication._doi.trim()) {
            url = `https://doi.org/${publication._doi.replace(/^doi:/, '')}`;
        } else if (publication.doi && publication.doi.trim()) {
            url = `https://doi.org/${publication.doi.replace(/^doi:/, '')}`;
        }
        
        // Return both content and URL for container-level handling
        return {
            content: tempDiv.innerHTML,
            url: url && url !== 'null' && url.trim() !== '' ? url : null
        };
    }
    
    // If link exists, extract URL and clean content
    const url = existingLink.href;
    existingLink.remove(); // Remove the embedded link
    
    return {
        content: tempDiv.innerHTML,
        url: url
    };
}

async function printList(orcid, idelement, sort = false, classify = false) {
    const container = document.getElementById(idelement);
    
    if (!container) {
        console.error(`Element with ID '${idelement}' not found`);
        return;
    }
    
    try {
        // Show loader with proper structure
        container.innerHTML = `
            <div class="loading">
                <div class="loader"></div>
                Loading publications...
            </div>
        `;
        
        // Add a small delay to ensure the loader is visible
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let publist = await getPubList(orcid);
        
        if (!publist || publist.length === 0) {
            container.innerHTML = '<div class="error">No publications found.</div>';
            return;
        }

        // Deduplicate publications by title (keeping most recent)
        publist = deduplicatePublications(publist);

        if (sort === true) {
            publist.sort((a, b) => b._year - a._year);
        }

        container.innerHTML = "";

        if (classify === true) {
            if (sort === false) {
                publist.sort((a, b) => b._year - a._year);
            }

            let conference = [], journal = [], other = [];

            for (let i = 0; i < publist.length; i++) {
                switch (publist[i].constructor.name) {
                    case "Article":
                    case "Book":
                    case "Inbook":
                    case "Incollection":
                    case "Proceedings":
                        journal.push(publist[i]);
                        break;
                    case "Inproceedings":
                        conference.push(publist[i]);
                        break;
                    default:
                        other.push(publist[i]);
                        break;
                }
            }

            // Render all publications without section titles
            let allPublications = [...journal, ...conference, ...other];
            
            for (let i = 0; i < allPublications.length; i++) {
                const pubElement = document.createElement('div');
                pubElement.className = 'publication';
                pubElement.style.animationDelay = `${(i * 0.1)}s`;
                
                // Get clean content and URL
                let content = allPublications[i].printDetails();
                content = stripPublicationWrapper(content);
                const enhanced = enhancePublicationContent(content, allPublications[i]);
                
                pubElement.innerHTML = enhanced.content;
                
                // Make container clickable if URL exists
                if (enhanced.url) {
                    pubElement.style.cursor = 'pointer';
                    pubElement.addEventListener('click', () => {
                        window.open(enhanced.url, '_blank');
                    });
                    
                    // Add data attribute for styling
                    pubElement.setAttribute('data-clickable', 'true');
                }
                
                container.appendChild(pubElement);
            }
            
        } else {
            // Simple chronological listing without year headers
            for (let i = 0; i < publist.length; i++) {
                const pubElement = document.createElement('div');
                pubElement.className = 'publication';
                pubElement.style.animationDelay = `${(i * 0.1)}s`;
                
                // Get clean content and URL
                let content = publist[i].printDetails();
                content = stripPublicationWrapper(content);
                const enhanced = enhancePublicationContent(content, publist[i]);
                
                pubElement.innerHTML = enhanced.content;
                
                // Make container clickable if URL exists
                if (enhanced.url) {
                    pubElement.style.cursor = 'pointer';
                    pubElement.addEventListener('click', () => {
                        window.open(enhanced.url, '_blank');
                    });
                    
                    // Add data attribute for styling
                    pubElement.setAttribute('data-clickable', 'true');
                }
                
                container.appendChild(pubElement);
            }
        }
        
    } catch (error) {
        console.error('Error in printList:', error);
        container.innerHTML = '<div class="error">Failed to load publications. Please check your network connection.</div>';
    }
}

function deduplicatePublications(publist) {
    const titleGroups = new Map();
    
    // Group publications by normalized title
    for (const pub of publist) {
        const title = pub._title || pub.title || '';
        const normalizedTitle = title.toLowerCase()
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/[^\w\s]/g, '');
        
        if (normalizedTitle) {
            if (!titleGroups.has(normalizedTitle)) {
                titleGroups.set(normalizedTitle, []);
            }
            titleGroups.get(normalizedTitle).push(pub);
        }
    }
    
    const deduplicated = [];
    
    // For each title group, select the best version
    for (const [title, publications] of titleGroups) {
        if (publications.length === 1) {
            deduplicated.push(publications[0]);
        } else {
            // Multiple versions - select the best one
            const best = publications.reduce((best, current) => {
                const bestJournal = (best._journal || '').toLowerCase();
                const currentJournal = (current._journal || '').toLowerCase();
                
                // Priority order: eLife > other journals > preprints
                const bestScore = getJournalScore(bestJournal);
                const currentScore = getJournalScore(currentJournal);
                
                if (currentScore > bestScore) {
                    return current;
                } else if (currentScore === bestScore) {
                    // Same priority, prefer more recent
                    return (current._year || 0) > (best._year || 0) ? current : best;
                }
                return best;
            });
            
            deduplicated.push(best);
        }
    }
    
    return deduplicated;
}

function getJournalScore(journal) {
    if (journal.includes('elife')) return 3;
    if (journal.includes('preprint') || journal.includes('biorxiv') || journal.includes('arxiv')) return 1;
    return 2; // Other journals
}

function formatAuthorName(fullName) {
    if (!fullName || typeof fullName !== 'string') {
        return fullName;
    }
    
    // Split the name by spaces and common separators
    const nameParts = fullName.trim().split(/[\s,]+/).filter(part => part.length > 0);
    
    if (nameParts.length === 0) {
        return fullName;
    }
    
    if (nameParts.length === 1) {
        // Only one name part, return as is
        return nameParts[0];
    }
    
    // Assume last part is surname, others are given names
    const surname = nameParts[nameParts.length - 1];
    const givenNames = nameParts.slice(0, -1);
    
    // Create initials from given names
    const initials = givenNames
        .map(name => name.charAt(0).toUpperCase())
        .join('. ');
    
    return `${surname} ${initials}.`;
}

function formatAuthorsForDisplay(authors) {
    if (!authors || authors.length === 0) {
        return 'Authors not specified';
    }
    
    // If it's already a string, split by common delimiters
    if (typeof authors === 'string') {
        const authorList = authors.split(/[,;]/).map(author => author.trim());
        
        // For long author lists, use a more compact format
        if (authorList.length > 4) {
            return authorList.slice(0, 3).join(', ') + ', et al.';
        }
        
        // For shorter lists, use proper conjunction
        if (authorList.length === 1) {
            return authorList[0];
        } else if (authorList.length === 2) {
            return authorList.join(' and ');
        } else {
            return authorList.slice(0, -1).join(', ') + ', and ' + authorList[authorList.length - 1];
        }
    }
    
    return authors;
}

function extractAuthorsFromOrcid(pubdetails) {
    // Try to extract authors from various ORCID metadata fields
    let authors = '';
    
    // Check for contributors (authors)
    if (pubdetails.contributors && pubdetails.contributors.contributor) {
        const contributors = pubdetails.contributors.contributor;
        const authorNames = contributors
            .filter(contrib => contrib.role === 'author' || !contrib.role)
            .map(contrib => {
                const credit = contrib['credit-name'];
                if (credit && credit.value) {
                    return credit.value;
                }
                return null;
            })
            .filter(name => name !== null);
        
        if (authorNames.length > 0) {
            authors = authorNames.join(', ');
        }
    }
    
    // Fallback to a generic author string if no specific authors found
    if (!authors) {
        authors = 'Authors not specified';
    }
    
    // Format authors in regular style (no surname/initial formatting)
    return formatAuthorsForDisplay(authors);
}

function createPublicationFromOrcidMetadata(pubdetails) {
    const title = pubdetails.title?.title?.value || 'Untitled Publication';
    const journal = pubdetails['journal-title']?.value || '';
    const year = pubdetails['publication-date']?.year?.value || new Date().getFullYear();
    const type = pubdetails.type || 'journal-article';
    const url = pubdetails['external-ids']?.['external-id']?.[0]?.['external-id-url']?.value || '';
    
    // Extract and format authors from ORCID metadata
    const authors = extractAuthorsFromOrcid(pubdetails);
    
    return {
        constructor: { name: 'Article' },
        _year: parseInt(year),
        _title: title,
        _journal: journal,
        _type: type,
        _url: url,
        _author: authors,
        
        // Add getter for consistency with Publication.js classes
        get author() {
            return this._author;
        },
        
        printDetails: function() {
            return `
                <p><strong>${this._title}</strong></p>
                <p>${this._author}</p>
                <p><em>${this._journal}</em></p>
                <p>${this._year}</p>
            `.trim();
        }
    };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const publicationsContent = document.getElementById('publications-content');
    
    if (!publicationsContent) {
        console.error('Publications content div not found');
        return;
    }
    
    printList('0000-0002-1517-3815', 'publications-content', true, true)
        .catch(error => {
            console.error('Error loading publications:', error);
            publicationsContent.innerHTML = '<div class="error">Failed to load publications. Please try again later.</div>';
        });
});

