document.addEventListener('DOMContentLoaded', function() {
    const experienceButtons = document.querySelectorAll('.experience-button');
    const experienceDetails = document.querySelector('.experience-details');
    const modal = document.getElementById('experience-modal');
    const modalContent = modal ? modal.querySelector('.experience-modal-details') : null;
    const closeBtn = modal ? modal.querySelector('.experience-modal-close') : null;
    const isMobile = () => window.innerWidth < 769;

    // Experience data following your project's data structure patterns
    const experienceData = {
        'position-1': {
            date: '2021 - Present',
            title: 'Postdoctoral Researcher',
            organization: 'Italian Institute of Technology (IIT)',
            organizationUrl: 'https://www.iit.it/',
            location: 'Genoa, Italy',
            description: `
                <p>My research focuses on dendritic spines spatial organization in 
                 determining pyramidal neurons computational abilities.</p>
                <h3>Key Responsibilities:</h3>
                <ul>
                    <li>Lead SynEMO project on spatial organization of synaptic inputs</li>
                    <li>Implementing imaging techniques for studying dendritic spines</li>
                    <li>Establishing analysis pipelines for large-scale imaging data</li>
                    <li>Mentoring graduate students and junior researchers</li>
                </ul>
                <h3>Major Achievements:</h3>
                <ul>
                    <li>Published papers in top-tier journals</li>
                    <li>Secured MSCA postdoctoral fellowship research funding (SynEMO)</li>
                    <li>Presented at international conferences</li>
                </ul>
            `
        },
        'position-2': {
            date: '2018 - 2023',
            title: 'Ph.D. in Neuroscience',
            organization: 'Interdisciplinary Institute for Neuroscience (IINS)',
            organizationUrl: 'https://www.iins.u-bordeaux.fr/',
            location: 'Bordeaux, France',
            description: `
                <p>My research focused on investigating the early electrophysiological properties
                of hippocampal CA3 pyramidal neurons selectively activated by one-trial behavior.</p>
                <h3>Research techniques:</h3>
                <ul>
                    <li>Ex-vivo patch clamp electrophysiology</li>
                    <li>Behavioral testing</li>
                </ul>
                <h3>Academic Achievements:</h3>
                <ul>
                    <li>Published research papers</li>
                    <li>Secured fundings for Ph.D. extension (LabEX, FRM)</li>
                    <li>Part of H2020-MSCA ETN "SyDAD" with European research institutes</li>
                    <li>Presented at international conferences</li>
                    <li>Awarded travel grants (FENS/IBRO-PERC, Société des Neurosciences)</li>
                    <li>Supervision of an undergraduate student</li>
                </ul>
            `
        },
        'position-3': {
            date: '2012 - 2016',
            title: 'M.Sc. thesis project',
            organization: 'Neuroscience Institute Cavalieri Ottolenghi (NICO)',
            organizationUrl: 'https://www.nico.ottolenghi.unito.it/',
            location: 'Turin, Italy',
            description: `
                <p>Investigation of how Purkinje cell-specific PTEN loss induces autistic-like behaviors 
                through cerebellar dysfunction, altered neuronal morphology, and synaptic imbalances.</p>
                <p>Spent two years at NICO during master’s studies and an additional year as a research assistant.</p>
                <h3>Research Contributions:</h3>
                <ul>
                    <li>Performed immunohistochemistry, confocal imaging, and behavior</li>
                    <li>Main contributor to a peer-reviewed publication</li>
                </ul>
            `
        }
    };

    experienceButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons (following your BEM-inspired patterns)
            experienceButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Get position data
            const positionId = this.dataset.position;
            const data = experienceData[positionId];
            if (data) {
                // Update details content with consistent styling structure
                const detailsHTML = `
                    <div class="details-header">
                        <div class="details-date">${data.date}</div>
                        <div class="details-title">${data.title}</div>
                        <div class="details-organization">
                            ${data.organizationUrl ? 
                                `<a href="${data.organizationUrl}" class="details-organization" target="_blank" rel="noopener noreferrer">${data.organization}</a>` : 
                                data.organization
                            }
                        </div>
                        <div class="details-location">${data.location}</div>
                    </div>
                    <div class="details-description">
                        ${data.description}
                    </div>
                `;
                if (isMobile() && modal && modalContent) {
                    modalContent.innerHTML = detailsHTML;
                    modal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                } else if (experienceDetails) {
                    experienceDetails.innerHTML = detailsHTML;
                    experienceDetails.classList.add('content-visible');
                }
            }
        });
    });

    // Modal close logic
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    // Only auto-select first position on desktop (not mobile)
    if (experienceButtons.length > 0 && !isMobile()) {
        experienceButtons[0].click();
    }
});