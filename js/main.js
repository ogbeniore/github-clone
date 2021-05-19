function toggleNav() {
  const navigation = document.getElementById('nav');
  const navIsOpen = navigation.classList.contains('open')
  if(navIsOpen) {
    navigation.classList.remove('open')
  } else {
    navigation.classList.add('open')
  }
}

const request = {
  'query': `
    {
      user(login: "ogbeniore") {
        avatarUrl
        name
        bio
        repositories(first: 20, orderBy: {field: CREATED_AT, direction: DESC}, privacy: PUBLIC) {
          totalCount
          nodes {
            forkCount
            description
            isFork
            name
            url
            updatedAt
            forks {
              totalCount
            }
            languages(first: 1) {
              edges {
                node {
                  name
                  color
                }
              }
            }
            nameWithOwner
            parent {
              url
              owner {
                id
              }
              nameWithOwner
            }
          }
        }
      }
    }
  `
}
let body = JSON.stringify(request);
window.onload = function() {
  fetch('https://api.github.com/graphql', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer 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`
    },
    body: body
  })
    .then(response => response.json())
    .then(({ data: { user } }) => {
      const { repositories: { nodes: repos } } = user;
      for (let element of document.querySelectorAll('[data-content]')) {
        // insert the corresponding info into the field
        let field = element.getAttribute('data-content');
        if(field === 'avatarUrl') {
          element.src = user[field];
          element.alt = user['name'];
        } else if(field === 'repoCount') {
          element.innerHTML = user.repositories.totalCount
        } else {
          element.innerHTML = user[field];
        }
      }
      generateRepoList(repos)
      toggleLoader()
    });
}


function generateRepoList(repositories) {
  const repoListElement = document.getElementById('repo-list');
  repositories.forEach(repository => {
    const {
      url,
      name,
      parent,
      isFork,
      description,
      languages,
      updatedAt,
      forks: {
        totalCount: forkCount
      }
    } = repository
    let listItem = document.createElement("li");
    listItem.classList.add('repo-list-item');
    let elementContent = `
      <div class="repo-details">
        <a href="${url}" class="repo-link">${name}</a>
        <span class="repo-fork">
          ${isFork ? `
            Forked from <a class="repo-fork-link" href="${parent.url}">
            ${parent.nameWithOwner}</a>
            ` : ''}
        </span>
        <p class="repo-description">
          ${description !== null ? description : ''}
        </p>
        <div class="repo-data">
          <span class="d-flex">
            <span class="repo-language-color" style="background-color:${languages && languages.edges && languages.edges[0] ? languages.edges[0].node.color : ''}"></span>
            <span>${languages && languages.edges && languages.edges[0] ? languages.edges[0].node.name : ''}</span>
          </span>

          <a class="repo-fork-count" href="#">
          ${
            forkCount ? `
              <svg aria-label="fork"  viewBox="0 0 16 16" version="1.1" width="16" height="16" role="img">
                <path fill-rule="evenodd" fill="#586069"
                  d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z">
                </path>
              </svg>
              ${forkCount}
            ` : ''
          }
          </a>
          Updated on ${formatDate(updatedAt)}
        </div>
      </div>
      <button class="repo-star-button">
        <svg class="octicon octicon-star mr-1" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
          <path fill-rule="evenodd" fill="#6a737d"
            d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z">
          </path>
        </svg>
        Star
      </button>
    `
    listItem.innerHTML = elementContent;
    repoListElement.append(listItem);
  });
}
function toggleLoader() {
  for (let element of document.querySelectorAll('[data-load]')) {
    element.style.display = 'block'
  }
  for (let element of document.querySelectorAll('[data-loader]')) {
    element.style.display = 'none'
  }
}
function formatDate(date) {
  const dateToFormat = new Date(date)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dev'
  ]
  return `${dateToFormat.getDate()} ${months[dateToFormat.getMonth()]} ${dateToFormat.getFullYear()}`
}