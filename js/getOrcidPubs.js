function includeJS(incFile) {
    document.write('<script type="text/javascript" src="'+ incFile+ '"></script>');
}


async function getPubList(orcid) {
    includeJS("js/Publication.js");
    includeJS("js/ParseBibtex.js");
    let link = "https://pub.orcid.org/v2.0/" + orcid + "/works";
    let list = [];
    await httpOrcidGet(link).then(async function (data) {
        data = JSON.parse(data);
        for (let i in data.group) {
            let publink = "https://pub.orcid.org/v2.0/" + orcid + "/work/" + data.group[i]["work-summary"][0]["put-code"];
            let pub = await httpOrcidGet(publink).then(function (pubdetails) {
                pubdetails = JSON.parse(pubdetails);
                return new ParseBibtex(pubdetails["citation"]["citation-value"]);
            });
            list.push(pub);
        }
    });
    return list;
}

function httpOrcidGet(url) {
    var request = new XMLHttpRequest();
    return new Promise(function(resolve, reject) {
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status >= 300) {
                    reject("Error, status code = " + request.status)
                } else {
                    resolve(request.responseText);
                }
            }
        };
        request.open('get', url, true);
        request.setRequestHeader("Accept", "application/json");
        request.send();
    });
}

async function printList(orcid, idelement, sort = false, classify = false) {
    let publist = await getPubList(orcid);

    // Sort publications if requested
    if (sort === true) {
        publist.sort((a, b) => b._year - a._year);
    }

    // Handle classification
    if (classify === true) {
        if (sort === false) {
            // Sort if not already sorted
            publist.sort((a, b) => b._year - a._year);
        }

        // Initialize classification arrays
        let conference = [], journal = [], other = [];

        // Classify publications
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

        // Render classified publications
        let container = document.getElementById(idelement);
        container.innerHTML = ""; // Clear the container

        if (journal.length > 0) {
            container.innerHTML += "<h1>Journal or Book</h1>";
            for (let i = 0; i < journal.length; i++) {
                container.innerHTML += journal[i].printDetails();
            }
        }
        if (conference.length > 0) {
            container.innerHTML += "<h1>Conference</h1>";
            for (let i = 0; i < conference.length; i++) {
                container.innerHTML += conference[i].printDetails();
            }
        }
        if (other.length > 0) {
            container.innerHTML += "<h1>Other</h1>";
            for (let i = 0; i < other.length; i++) {
                container.innerHTML += other[i].printDetails();
            }
        }
    } else {
        // Render publications by year if not classified
        let container = document.getElementById(idelement);
        container.innerHTML = ""; // Clear the container
        let year = publist[0]._year;

        container.innerHTML += "<h1>" + year + "</h1>";
        for (let i = 0; i < publist.length; i++) {
            if (publist[i]._year !== year) {
                year = publist[i]._year;
                container.innerHTML += "<h1>" + year + "</h1>";
            }
            container.innerHTML += publist[i].printDetails();
        }
    }
}

