const REPO_PER_PAGE = 5;

class View {
  constructor(search) {
    this.search = search;
    this.app = document.querySelector(".app");
    this.wrapper = this.createElement("div", "wrapper");
    this.input = this.createElement("input", "search");
    this.app.append(this.wrapper);
    this.wrapper.append(this.input);
    this.searchResult = this.createElement("ul", "search_result");
    this.wrapper.append(this.searchResult);
  }

  createElement(tagEl, classEl) {
    const inp = document.createElement(tagEl);
    if (classEl) inp.classList.add(classEl);
    return inp;
  }

  createRepo(data) {
    const repoElement = this.createElement("li", "search_repo");

    repoElement.style.listStyleType = "none";
    repoElement.style.width = "10em";
    repoElement.style.background = "#E3E3E3";
    repoElement.style.height = "1em";
    repoElement.style.border = "1px solid black";

    this.searchResult.style.paddingLeft = "0px";

    repoElement.addEventListener("click", () => this.showRepo(data));
    repoElement.textContent = `${data.name}`;

    this.searchResult.append(repoElement);
  }
  clearRepo() {
    this.searchResult.innerHTML = "";
  }

  async loadRepoData(name, owner, stargazers) {
    const urls = [
      `https://api.github.com/repositories/${name}`,
      `https://api.github.com/repositories/${owner}`,
      `https://api.github.com/repositories/${stargazers}`,
    ];
    const requests = urls.map((url) => fetch(url));
    return Promise.all(requests).then((responses) =>
      Promise.all(responses.map((r) => r.json()))
    );
  }

  showRepo(RepoData) {
    const name = RepoData.name;
    const owner = RepoData.owner.login;
    const star = RepoData.stargazers_count;

    const search_out = this.createElement("div", "search_out");
    const card = this.createElement("ul", 'card');
    const card_delete = this.createElement('button')

    this.loadRepoData(name, owner, star).then(() => {
      const card_text = [...document.querySelectorAll("li")];
      const card_name = this.createElement("li");
      const card_owner = this.createElement("li");
      const card_star = this.createElement("li");

      card_text.forEach((i) => (i.className += "card-text"));

      card.style.listStyleType = "none";
      card.style.paddingLeft = "0";
      card.style.margin = '0';

      search_out.style.display = "flex";
      search_out.style.background = "#E27BEB";
      search_out.style.height = "5em";
      search_out.style.width = "10em";
      search_out.style.border = "1px solid black";

      card_delete.style.marginLeft = 'auto'
      card_delete.style.background = 'red'

      card_name.textContent = `Name: ${name}`;
      card_owner.textContent = `Owner: ${owner}`;
      card_star.textContent = `Stars: ${star}`;

      search_out.appendChild(card)
      search_out.appendChild(card_delete);

      card.appendChild(card_name);
      card.appendChild(card_owner);
      card.appendChild(card_star);
      
      card_delete.addEventListener('click', () => {
        search_out.remove(RepoData)
      })

      this.wrapper.append(search_out)
      
    });
    
  }

}

class Search {
  constructor(view) {
    this.view = view;
    this.view.input.addEventListener(
      "keyup",
      this.debounce(this.searchContent.bind(this), 400)
    );
  }

  async searchContent(page, isUpdate = false) {
    if (!isUpdate) {
      this.view.clearRepo();
    }
    return await fetch(
      `https://api.github.com/search/repositories?q=${this.view.input.value}&per_page=${REPO_PER_PAGE}&page=${page}`
    ).then((res) => {
      res.json().then((res) => {
        if (res.items) {
          res.items.forEach((repo) => this.view.createRepo(repo));
        } else {
          this.view.clearRepo();
        }
      });
    })
  }

  debounce (fn, debounceTime) {
    let block
    return function wrapper(...arg) {
        clearTimeout(block)
        block = setTimeout(() => fn.apply(this, arg), debounceTime);
    };
  };
}

new Search(new View());
