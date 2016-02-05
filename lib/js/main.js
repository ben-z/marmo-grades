'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResultItem = function (_React$Component) {
  _inherits(ResultItem, _React$Component);

  function ResultItem(props) {
    _classCallCheck(this, ResultItem);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ResultItem).call(this, props));

    _this._getBestResult = _this._getBestResult.bind(_this);
    return _this;
  }

  _createClass(ResultItem, [{
    key: '_getBestResult',
    value: function _getBestResult() {
      var bestResult = undefined;
      var results = this.props.results;
      for (var i = 0; i < results.length; i++) {
        var result = results[i];
        if (!bestResult) {
          bestResult = result;
        } else if (result.outcome === 'passed' && bestResult.outcome === 'failed') {
          bestResult = result;
        } else if (result.outcome === bestResult.outcome) {
          if (result.points > bestResult.points) {
            bestResult = result;
          }
        }
      }
      return bestResult;
    }
  }, {
    key: 'render',
    value: function render() {
      var result = this._getBestResult();
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
        };
      }
      return React.createElement(
        'tr',
        null,
        React.createElement(
          'td',
          null,
          result.timestamp
        ),
        React.createElement(
          'td',
          null,
          this.props.project
        ),
        React.createElement(
          'td',
          null,
          result.status
        ),
        React.createElement(
          'td',
          null,
          result.outcome
        ),
        React.createElement(
          'td',
          null,
          result.short
        ),
        React.createElement(
          'td',
          null,
          result.long
        )
      );
    }
  }]);

  return ResultItem;
}(React.Component);

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
};

var App = function (_React$Component2) {
  _inherits(App, _React$Component2);

  function App(props) {
    _classCallCheck(this, App);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, props));

    _this2.state = {
      projectList: [],
      user: _this2.props.user || '',
      results: []
    };
    console.log(_this2.props.user, _this2.state.user);
    _this2._getProjects = _this2._getProjects.bind(_this2);
    _this2._getResults = _this2._getResults.bind(_this2);
    _this2._updateUser = _this2._updateUser.bind(_this2);
    return _this2;
  }

  _createClass(App, [{
    key: '_getProjects',
    value: function _getProjects(callback) {
      var that = this;
      $.getJSON(that.props.listURL, function (data) {
        data.reverse();
        that.setState({
          projectList: data
        });
        callback();
      });
    }
  }, {
    key: '_getResults',
    value: function _getResults(u) {
      var that = this;
      if (!(u || that.state.user)) return;

      var _loop = function _loop() {
        var p = that.state.projectList[i];
        var user = u || that.state.user;
        console.log('user', user);
        var project = p.project;
        var url = that.props.resultURL;
        that.setState({
          results: []
        });
        $.getJSON(url + '?project=' + project + '&user=' + user, function (data) {
          if (data.err) throw data.err;

          var resultArr = data.result;
          var results = that.state.results;
          results.push({ project: project, results: resultArr });
          that.setState({
            results: results
          });
        });
      };

      for (var i = 0; i < that.state.projectList.length; i++) {
        _loop();
      }
    }
  }, {
    key: '_updateUser',
    value: function _updateUser(e) {
      e.preventDefault();
      console.log('Updating');
      this.setState({
        user: this.refs.user.value
      });
      this._getResults(this.refs.user.value);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      this._getProjects(function () {
        _this3._getResults();
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (typeof Storage !== 'undefined') {
        localStorage.marmogrades_user = this.state.user;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var results = this.state.results.sort(function (a, b) {
        if (a.project.toLowerCase() > b.project.toLowerCase()) return -1;
        return 1;
      });
      results = $.map(results, function (elem, i) {
        return React.createElement(ResultItem, { project: elem.project, results: elem.results, key: elem.project });
      });
      var message = this.state.user ? 'Loading for ' + this.state.user + '...' : 'Waiting for input...';
      return React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          null,
          'Input your WatIAM username below and click "Update". Your best submission for each project will be displayed.'
        ),
        React.createElement(
          'form',
          { className: 'pure-form' },
          React.createElement('input', { type: 'text', ref: 'user', defaultValue: this.state.user }),
          React.createElement(
            'button',
            { onClick: this._updateUser, className: 'pure-button pure-button-primary' },
            'Update'
          )
        ),
        React.createElement('br', null),
        React.createElement(
          'div',
          null,
          React.createElement(
            'table',
            { className: 'pure-table' },
            React.createElement(
              'thead',
              null,
              React.createElement(
                'tr',
                null,
                React.createElement(
                  'td',
                  null,
                  'Timestamp'
                ),
                React.createElement(
                  'td',
                  null,
                  'Project'
                ),
                React.createElement(
                  'td',
                  null,
                  'Status'
                ),
                React.createElement(
                  'td',
                  null,
                  'Outcome'
                ),
                React.createElement(
                  'td',
                  null,
                  'Short Description'
                ),
                React.createElement(
                  'td',
                  null,
                  'Long Description'
                )
              )
            ),
            React.createElement(
              'tbody',
              null,
              results
            )
          )
        ),
        message
      );
    }
  }]);

  return App;
}(React.Component);

App.propTypes = {
  listURL: React.PropTypes.string.isRequired,
  resultURL: React.PropTypes.string.isRequired,
  user: React.PropTypes.string
};

if (document) {
  var listURL = 'https://www.student.cs.uwaterloo.ca/~cs136/cgi-bin/marmoset-utils/project-list.rkt';
  var resutlURL = 'https://www.student.cs.uwaterloo.ca/~cs136/cgi-bin/marmoset-utils/public-test-results.rkt';

  var marmogrades_user = typeof Storage !== 'undefined' && localStorage.marmogrades_user ? localStorage.marmogrades_user : null;

  ReactDOM.render(React.createElement(App, { listURL: listURL, resultURL: resutlURL, user: marmogrades_user }), document.getElementById('app'));
}