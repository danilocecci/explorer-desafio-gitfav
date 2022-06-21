import { GithubUser } from './GithubUser.js'

export class Favs {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@gitfav:')) || []
  }

  save() {
    localStorage.setItem('@gitfav:', JSON.stringify(this.entries))
  }

  async addUser(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)
      if (userExists) {
        throw new Error('Usuário já cadastrado!')
      }

      const githubUser = await GithubUser.search(username)

      if (githubUser.login === undefined) {
        throw new Error('Usuário não encontrado')
      }

      this.entries = [githubUser, ...this.entries]
      this.update()
      this.save()
    } catch (err) {
      alert(err.message)
    }
  }

  delete(userToDelete) {
    this.entries = this.entries.filter(user => user.login !== userToDelete)
    this.update()
    this.save()
  }
}

export class FavView extends Favs {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('tbody')

    this.update()
    this.favUser()
  }

  favUser() {
    const userInput = this.root.querySelector('.userInput')
    const favBtn = this.root.querySelector('.btnFav')
    favBtn.onclick = () => {
      const { value } = this.root.querySelector('.userInput')
      this.addUser(value)
      userInput.value = ''
    }

    userInput.addEventListener('keypress', keyPressed => {
      if (keyPressed.key == 'Enter') {
        this.addUser(userInput.value)
        userInput.value = ''
      }
    })
  }

  update() {
    this.removeAllRows()
    this.generateFavRow()
    this.isEmpty()
  }

  isEmpty() {
    if (this.entries.length == 0) {
      const tr = document.createElement('tr')

      tr.innerHTML = `
      <td colspan="4">
        <div class="emptyFav">
          <img src="./assets/estrela.svg" />
          Nenhum favorito ainda
        </div>
      </td>
      `

      this.tbody.append(tr)
    }
  }

  removeAllRows() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }

  createFavRow(user) {
    const tr = document.createElement('tr')

    tr.innerHTML = `
    <td>
      <div class="user-field">
        <a
          class="user"
          href="https://github.com/${user.login}"
          target="_blank"
        >
          <img
            src="https://github.com/${user.login}.png"
            alt="Imagem de perfil de ${user.name}"
            class="profilePic"
          />
          <div class="username">
            <p>${user.name}</p>
            <span>${user.login}</span>
          </div>
        </a>
      </div>
    </td>
    <td>${user.public_repos}</td>
    <td>${user.followers}</td>
    <td>
      <button class="remove">Remover</button>
    </td>
    `

    return tr
  }

  generateFavRow() {
    this.entries.forEach(user => {
      const favRow = this.createFavRow(user)

      favRow.querySelector('.remove').onclick = () => {
        const isOk = confirm(`Tem certeza que deseja apagar "${user.name}" ?`)
        if (isOk) {
          this.delete(user.login)
        }
      }

      this.tbody.append(favRow)
    })
  }
}
