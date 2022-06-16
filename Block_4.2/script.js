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
  // class зарезервирован, поэтому нельзя прописать аргументом слово - class :(
  createElement(tag, classEl) {
    const element = document.createElement(tag);
    if (classEl) element.classList.add(classEl);
    return element;
  }

  // Я надеюсь правильно понял, что не нужно добавлять файл css, а все стили должны быть через js
  createRepo(data) {
    const repoElement = this.createElement("li", "search_repo");

    repoElement.style.cssText = `
    list-style-type: none;
    width: 10em;
    background: #e3e3e3;
    height: 1em;
    border: 1px solid black; `;

    this.searchResult.style.cssText = `
    padding-left: 0;
    `;

    const that = this;
    repoElement.addEventListener("click", function repoClick() {
      that.showRepo(data);
      that.input.value = "";
    });
    repoElement.textContent = `${data.name}`;

    that.searchResult.append(repoElement);
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
    await Promise.all(requests).then((responses) =>
      responses.map((r) => r.json())
    );
  }

  showRepo(RepoData) {
    const { name, owner, stargazers_count } = RepoData;
    const search_out = this.createElement("div", "search_out");
    const card = this.createElement("ul", "card");
    const card_delete = this.createElement("button");

    search_out.style.cssText = `
    display: flex;
    background: #E27BEB;
    height: 5em;
    width: 10em;
    border: 1px solid black; `;

    card.style.cssText = `
    list-style-type: none;
    padding-left: 0;
    margin: 0;
    `;
    card_delete.style.cssText = `
    margin-left: auto;
    background-color: red;
    `;

    this.loadRepoData(name, owner, stargazers_count).then(() => {
      const card_name = this.createElement("li");
      const card_owner = this.createElement("li");
      const card_star = this.createElement("li");

      card_name.textContent = `Name: ${name}`;
      card_owner.textContent = `Owner: ${owner.login}`;
      card_star.textContent = `Stars: ${stargazers_count}`;

      search_out.appendChild(card);
      search_out.appendChild(card_delete);

      card.appendChild(card_name);
      card.appendChild(card_owner);
      card.appendChild(card_star);

      card_delete.addEventListener("click", function repoDelete() {
        search_out.remove(RepoData);
      });

      this.wrapper.append(search_out);
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

  async RepoLoad(page) {
    return await fetch(
      `https://api.github.com/search/repositories?q=${this.view.input.value}&per_page=${REPO_PER_PAGE}&page=${page}`
    );
  }

  async searchContent(isUpdate = false) {
    if (!isUpdate) {
      this.view.clearRepo();
    }
    this.RepoLoad().then((res) => {
      res.json().then((res) => {
      if (res.items) {
        res.items.forEach((repo) => this.view.createRepo(repo));
      } else {
        this.view.clearRepo();
      }
    })
    });
  }

  debounce(fn, debounceTime) {
    let block;
    return function wrapper(...arg) {
      clearTimeout(block);
      block = setTimeout(() => fn.apply(this, arg), debounceTime);
    };
  }
}

new Search(new View());