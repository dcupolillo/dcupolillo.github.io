async function httpGitHubGet(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`GitHub API request failed: ${xhr.status}`));
                }
            }
        };
        
        xhr.send();
    });
}

async function getRepoCommitActivity(username, repoName) {
    const url = `https://api.github.com/repos/${username}/${repoName}/stats/commit_activity`;
    
    try {
        const response = await httpGitHubGet(url);
        const activity = JSON.parse(response);
        
        // GitHub returns 52 weeks of data, get last 12 weeks for compact display
        if (activity && activity.length > 0) {
            return activity.slice(-12).map(week => week.total);
        }
        return [];
    } catch (error) {
        console.warn(`Could not fetch activity for ${repoName}:`, error);
        return [];
    }
}

function createActivityChart(activityData) {
    if (!activityData || activityData.length === 0) {
        return '<div class="activity-chart no-data">No recent activity</div>';
    }
    
    const maxCommits = Math.max(...activityData, 1);
    const chartWidth = 200;
    const chartHeight = 30;
    
    // Generate SVG path for line chart
    const points = activityData.map((commits, index) => {
        const x = (index / (activityData.length - 1)) * chartWidth;
        const y = chartHeight - ((commits / maxCommits) * chartHeight);
        return `${x},${y}`;
    }).join(' ');
    
    return `
        <div class="activity-chart">
            <svg width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}">
                <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#39d353" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#39d353" stop-opacity="0.05"/>
                    </linearGradient>
                </defs>
                
                <!-- Area fill -->
                <path d="M 0,${chartHeight} L ${points} L ${chartWidth},${chartHeight} Z" 
                      fill="url(#areaGradient)" />
                
                <!-- Line -->
                <polyline points="${points}" 
                          fill="none" 
                          stroke="#39d353" 
                          stroke-width="2" 
                          stroke-linecap="round" 
                          stroke-linejoin="round" />
            </svg>
        </div>
    `;
}

async function getGitHubRepos(username) {
    const url = `https://api.github.com/users/${username}/repos?sort=updated&direction=desc&per_page=20`;
    
    try {
        const response = await httpGitHubGet(url);
        const repos = JSON.parse(response);
        
        // Filter out forks and archived repos
        return repos.filter(repo => 
            !repo.fork && 
            !repo.archived && 
            repo.name !== `${username}.github.io`
        );
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
        throw error;
    }
}

async function createProjectFromRepo(repo, username) {
    // Fetch commit activity for this repository
    const activityData = await getRepoCommitActivity(username, repo.name);
    
    return {
        name: repo.name,
        description: repo.description || 'No description available',
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updated: new Date(repo.updated_at),
        url: repo.html_url,
        homepage: repo.homepage,
        topics: repo.topics || [],
        activity: activityData,
        
        printDetails: function() {
            const languageClass = this.language ? this.language.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'unknown';
            
            return `
                <div class="project-content">
                    <div class="project-left">
                        <h3>${this.name}</h3>
                        <p class="project-description">${this.description}</p>
                        <div class="project-topics">
                            ${this.topics.map(topic => `<span class="topic">${topic}</span>`).join('')}
                        </div>
                    </div>
                    <div class="project-right">
                        <div class="project-meta">
                            <span class="language ${languageClass}">${this.language}</span>
                            <span class="stars">⭐ ${this.stars}</span>
                            <span class="forks">🍴 ${this.forks}</span>
                        </div>
                        <div class="project-activity">
                            <span class="activity-label">Activity:</span>
                            ${createActivityChart(this.activity)}
                        </div>
                    </div>
                </div>
            `.trim();
        }
    };
}

async function printGitHubProjects(username, elementId, maxRepos = 6) {
    const container = document.getElementById(elementId);
    
    if (!container) {
        console.error(`Element with ID '${elementId}' not found`);
        return;
    }
    
    try {
        // Show loader
        container.innerHTML = `
            <div class="loading">
                <div class="loader"></div>
                Loading projects...
            </div>
        `;
        
        // Add delay to show loader
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const repos = await getGitHubRepos(username);
        const limitedRepos = repos.slice(0, maxRepos);
        
        if (limitedRepos.length === 0) {
            container.innerHTML = '<div class="error">No repositories found.</div>';
            return;
        }
        
        container.innerHTML = "";
        
        // Process repos sequentially to avoid rate limiting
        for (let i = 0; i < limitedRepos.length; i++) {
            const repo = limitedRepos[i];
            const project = await createProjectFromRepo(repo, username);
            const projectElement = document.createElement('div');
            projectElement.className = 'project';
            projectElement.style.animationDelay = `${(i * 0.1)}s`;
            
            projectElement.innerHTML = project.printDetails();
            
            // Make entire container clickable to repository
            projectElement.style.cursor = 'pointer';
            projectElement.addEventListener('click', () => {
                window.open(project.url, '_blank');
            });
            
            projectElement.setAttribute('data-clickable', 'true');
            container.appendChild(projectElement);
            
            // Small delay between requests to be API-friendly
            if (i < limitedRepos.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
    } catch (error) {
        console.error('Error in printGitHubProjects:', error);
        container.innerHTML = '<div class="error">Failed to load projects. Please check your network connection.</div>';
    }
}