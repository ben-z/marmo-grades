class ResultItem extends React.Component {
  constructor (props) {
    super(props)
    this._getBestResult = this._getBestResult.bind(this)
  }
  _getBestResult () {
    let bestResult
    let results = this.props.results
    for (var i = 0; i < results.length; i++) {
      let result = results[i]
      if (!bestResult) {
        bestResult = result
      } else if (result.outcome === 'passed' && bestResult.outcome === 'failed') {
        bestResult = result
      } else if (result.outcome === bestResult.outcome) {
        if (result.points > bestResult.points) {
          bestResult = result
        }
      }
    }
    return bestResult
  }
  render () {
    let result = this._getBestResult()
    if (!result) {
      result = {
        name: '-',
        long: '-',
        short: '-',
        timestamp: '-',
        student: '-',
        project: '-',
        submission: '-',
        points: '-',
        passed: '-',
        all: '-',
        status: '-',
        outcome: '-'
      }
    }
    return (
      <tr>
        <td>{result.timestamp}</td>
        <td>{this.props.project}</td>
        <td>{result.status}</td>
        <td>{result.outcome}</td>
        <td>{result.short}</td>
        <td>{result.long}</td>
      </tr>
    )
  }
}

ResultItem.propTypes = {
  project: React.PropTypes.string,
  results: React.PropTypes.arrayOf(React.PropTypes.shape({
    name: React.PropTypes.string,
    long: React.PropTypes.string,
    short: React.PropTypes.string,
    timestamp: React.PropTypes.string,
    student: React.PropTypes.number,
    project: React.PropTypes.string,
    submission: React.PropTypes.number,
    points: React.PropTypes.number,
    passed: React.PropTypes.number,
    all: React.PropTypes.number,
    status: React.PropTypes.string,
    outcome: React.PropTypes.string
  }))
}

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      projectList: [],
      user: this.props.user || '',
      results: []
    }
    this._getProjects = this._getProjects.bind(this)
    this._getResults = this._getResults.bind(this)
    this._updateUser = this._updateUser.bind(this)
  }
  _getProjects (callback) {
    let that = this
    $.getJSON(that.props.listURL, (data) => {
      data.reverse()
      that.setState({
        projectList: data
      })
      callback()
    })
  }
  _getResults (u) {
    let that = this
    if (!(u || that.state.user)) return
    for (var i = 0; i < that.state.projectList.length; i++) {
      let p = that.state.projectList[i]
      let user = u || that.state.user
      console.log('user', user)
      let project = p.project
      let url = that.props.resultURL
      that.setState({
        results: []
      })
      $.getJSON(`${url}?project=${project}&user=${user}`, (data) => {
        if (data.err) throw data.err

        let resultArr = data.result
        let results = that.state.results
        results.push({project: project, results: resultArr})
        that.setState({
          results: results
        })
      })
    }
  }
  _updateUser (e) {
    e.preventDefault()
    console.log('Updating')
    this.setState({
      user: this.refs.user.value
    })
    this._getResults(this.refs.user.value)
  }
  componentDidMount () {
    this._getProjects(() => {
      this._getResults()
    })
  }
  render () {
    let results = this.state.results.sort((a, b) => {
      if (a.project.toLowerCase() > b.project.toLowerCase()) return -1
      return 1
    })
    results = $.map(results, (elem, i) => {
      return <ResultItem project={elem.project} results={elem.results} key={elem.project} />
    })
    let message = (this.state.user) ? `Loading for ${this.state.user}...` : 'Waiting for input...'
    return (
    <div>
      <p>Input your WatIAM username below and click "Update". Your best submission for each project will be displayed.</p>
      <form className='pure-form'>
        <input type='text' ref='user' />
        <button onClick={this._updateUser} className='pure-button pure-button-primary'>Update</button>
      </form>
      <br />
      <div>
        <table className='pure-table'>
          <thead>
            <tr>
              <td>Timestamp</td>
              <td>Project</td>
              <td>Status</td>
              <td>Outcome</td>
              <td>Short Description</td>
              <td>Long Description</td>
            </tr>
          </thead>
          <tbody>
            {results}
          </tbody>
        </table>
      </div>
      {message}
    </div>
    )
  }
}

App.propTypes = {
  listURL: React.PropTypes.string.isRequired,
  resultURL: React.PropTypes.string.isRequired,
  user: React.PropTypes.string
}

if (document) {
  let listURL = 'https://www.student.cs.uwaterloo.ca/~cs136/cgi-bin/marmoset-utils/project-list.rkt'
  let resutlURL = 'https://www.student.cs.uwaterloo.ca/~cs136/cgi-bin/marmoset-utils/public-test-results.rkt'
  window.React = React
  ReactDOM.render(<App listURL={listURL} resultURL={resutlURL} />, document.getElementById('app'))
}
