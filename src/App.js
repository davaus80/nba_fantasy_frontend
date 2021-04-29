import {useEffect, useState} from "react"
import logo from './logo.svg';
import axios from "axios"
import BootstrapTable from 'react-bootstrap-table-next'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import './App.css';


function App() {

  const [comparisonLoading, setComparisonLoading] = useState(false); // Bool that indicates if the comparison table data is loading or not
  const [tableLoading, setTableLoading] = useState(false); // Bool that indicates if the team table data is loading or not
  const [playerData1, setPlayerData1] = useState([]); // Array of dictionary objects with player data for team 1
  const [playerNames1, setPlayerNames1] = useState([]); // Array of player names for team 1
  const [playerData2, setPlayerData2] = useState([]); // Array of dictionary objects with player data for team 2
  const [playerNames2, setPlayerNames2] = useState([]); // Array of player names for team 2
  const [playerName, setPlayerName] = useState("") // String currently in the add player form
  const [teamComparison, setTeamComparison] = useState([]); // Array of dictionary objects with team1 total stats, team2 total stats, and the difference

  // Handle writing player name in form line
  function handleEvent(event, result) {
    event.preventDefault()
    let { value } = result || event.target
    setPlayerName(value, [])
  }

  // Add newPlayerInfo to playerData and playerNames for teamNum
  const addPlayer = (newPlayerInfo, teamNum) => {
    
    if (teamNum === 1) {
      var updatedplayerData = playerData1;
      updatedplayerData.push(newPlayerInfo);
      setPlayerData1(updatedplayerData);
      var updatedplayerNames = playerNames1;
      updatedplayerNames.push(newPlayerInfo['name']);
      setPlayerNames1(updatedplayerNames);
    } else {
      var updatedplayerData = playerData2;
      updatedplayerData.push(newPlayerInfo);
      setPlayerData2(updatedplayerData);
      var updatedplayerNames = playerNames2;
      updatedplayerNames.push(newPlayerInfo['name']);
      setPlayerNames2(updatedplayerNames);
    }
    setTableLoading(false)
  }

  // Handle the loading and addition of the player with the name in playerName to the team of teamNum
  async function handlePlayerAdd(teamNum) {
    setTableLoading(true);
    const url = "/api/player/laststatlines"
    const payload = {
      "player_name": playerName,
      "num_statlines": 1,
    }; 
    axios.post(url, payload)
    .then((postResponse) => {
         addPlayer(postResponse.data.results[0], teamNum);
      }
    )
    .catch((errors) => {
      console.error(errors);
      setTableLoading(false)
    })
  }

  // Handle the deletion of the specified player from the specified team.
  // TODO: get re-render after deletion
  const handleDelete = (playerName, teamNum) => {
    setTableLoading(true)
    console.log(playerName)
    var arrayCopy = playerData1;
    var nameArrayCopy = playerNames1;
    console.log(arrayCopy)
    console.log(nameArrayCopy)
    if (teamNum === 2) {
      arrayCopy = playerData2;
      nameArrayCopy = playerNames2;
    }
    const arrayLength = arrayCopy.length;
    for (var i = 0; i < arrayLength; i++) {
      if (arrayCopy[i]['name'] === playerName) {
        arrayCopy.splice(i, 1);
        break;
      }
    }
    const nameArrayLength = nameArrayCopy.length;
    for (var i = 0; i < nameArrayLength; i++) {
      if (nameArrayCopy[i] === playerName) {
        nameArrayCopy.splice(i, 1);
        break;
      }
    }
    if (teamNum === 1) {
      setPlayerData1(arrayCopy)
      setPlayerNames1(nameArrayCopy)
    }
    if (teamNum === 2) {
      setPlayerData2(arrayCopy)
      setPlayerNames2(nameArrayCopy)
    }
    setTableLoading(false)
  }
  
  // update comparison state based on new comparisonData
  const handleComparisonData = (comparisonData) => {
    var teamData1 = comparisonData.statline1;
    teamData1["name"] = "Team 1";
    teamData1["fgpct"] = teamData1["fgm"] / teamData1["fga"]
    teamData1["ftpct"] = teamData1["ftm"] / teamData1["fta"]
    var teamData2 = comparisonData.statline2;
    teamData2["name"] = "Team 2";
    teamData2["fgpct"] = teamData2["fgm"] / teamData2["fga"]
    teamData2["ftpct"] = teamData2["ftm"] / teamData2["fta"]
    var teamDifference = comparisonData.difference;
    teamDifference["name"] = "Difference";
    teamDifference["fgpct"] = (teamData2["fgpct"] - teamData1["fgpct"]).toFixed(3)
    teamDifference["ftpct"] = (teamData2["ftpct"] - teamData1["ftpct"]).toFixed(3)
    teamData1["fgpct"] = teamData1["fgpct"].toFixed(3)
    teamData2["fgpct"] = teamData2["fgpct"].toFixed(3)
    teamData1["ftpct"] = teamData1["ftpct"].toFixed(3)
    teamData2["ftpct"] = teamData2["ftpct"].toFixed(3)
    const updatedComparisonData = [teamData1, teamData2, teamDifference];
    setTeamComparison(updatedComparisonData);
    setComparisonLoading(false)
  }

  // handle loading and updating of comparison data
  async function handleComparison() {
    setComparisonLoading(true);
    const url = "/api/statline/compareteams"
    const payload = {
      "player_list1": playerNames1,
      "player_list2": playerNames2,
    }; 
    axios.post(url, payload)
    .then((postResponse) => {
         handleComparisonData(postResponse.data);
      }
    )
    .catch((errors) => {
      console.error(errors);
      setComparisonLoading(false)
    })
  }

  // columns for team1 table
  const columns1 = [
    { dataField: 'name', text: 'Name'},
    { dataField: 'fg3m', text: '3PM' }, 
    { dataField: 'fgm', text: 'FGM' }, 
    { dataField: 'fga', text: 'FGA' }, 
    { dataField: 'ftm', text: 'FTM' }, 
    { dataField: 'fta', text: 'FTA' }, 
    { dataField: 'pts', text: 'PTS' }, 
    { dataField: 'reb', text: 'REB' },
    { dataField: 'ast', text: 'AST' },
    { dataField: 'stl', text: 'STL' },
    { dataField: 'blk', text: 'BLK' },
    { dataField: 'tov', text: 'TOV' },
    { dataField: 'name',
        text: 'Remove',
        editable: false,
        formatter: (cellContent, row) => {
          return (
            <Button 
              variant="danger"
              onClick={()=>handleDelete(row.name, 1)}
            >
              Delete
            </Button>
          )
        }
    },
  ]

  // columns for team2 table. same as columns1 but with different parameter for delete button
  const columns2 = [
    { dataField: 'name', text: 'Name'},
    { dataField: 'fg3m', text: '3PM' }, 
    { dataField: 'fgm', text: 'FGM' }, 
    { dataField: 'fga', text: 'FGA' }, 
    { dataField: 'ftm', text: 'FTM' }, 
    { dataField: 'fta', text: 'FTA' }, 
    { dataField: 'pts', text: 'PTS' }, 
    { dataField: 'reb', text: 'REB' },
    { dataField: 'ast', text: 'AST' },
    { dataField: 'stl', text: 'STL' },
    { dataField: 'blk', text: 'BLK' },
    { dataField: 'tov', text: 'TOV' },
    { dataField: 'name',
        text: 'Remove',
        editable: false,
        formatter: (cellContent, row) => {
          return (
            <Button 
              variant="danger"
              onClick={()=>handleDelete(row.name, 2)}
            >
              Delete
            </Button>
          )
        }
    },
  ]

  // columns for comparison table
  const compareColumns = [
    { dataField: 'name', text: 'Team'},
    { dataField: 'fg3m', text: '3PM' }, 
    { dataField: 'fgpct', text: 'FG%' }, 
    { dataField: 'ftpct', text: 'FT%' }, 
    { dataField: 'pts', text: 'PTS' }, 
    { dataField: 'reb', text: 'REB' },
    { dataField: 'ast', text: 'AST' },
    { dataField: 'stl', text: 'STL' },
    { dataField: 'blk', text: 'BLK' },
    { dataField: 'tov', text: 'TOV' },
  ]

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Fantasy App
        </p>
      </header>
      <Container>
        <Row className="App-container">
          <Form>
            <Form.Group controlId="playerName">
              <Form.Label>Add Player</Form.Label>
              <Form.Control 
                type="input" 
                label="Player Name"
                onChange={handleEvent}
                value={playerName}
              >
              </Form.Control>
            </Form.Group>
            <Button variant="primary" onClick={() => handlePlayerAdd(1)}>
              Add to Team 1
            </Button>
            <Button variant="primary" onClick={() => handlePlayerAdd(2)}>
              Add to Team 2
            </Button>
            <Button variant="primary" onClick={() => handleComparison()}>
              Compare Teams
            </Button>
          </Form>
        </Row>
        <Row className="App-container">
          <Col xs={10} md={6}>
            <div>
              <p className="App-sectionheader">
                Team 1
              </p>
              { tableLoading ? (
                  <Spinner animation="border" role="status">
                      <span className="sr-only">Loading...</span>
                  </Spinner>
                ) : (
                  <BootstrapTable 
                    keyField='name' 
                    data={ playerData1 }
                    columns={ columns1 }
                    striped
                    bordered={false}
                    wrapperClasses="table-responsive"
                  />
                )
              }
            </div>
          </Col>
          <Col xs={10} md={6}>
            <div>
              <p className="App-sectionheader">
                Team 2
              </p>
              { tableLoading ? (
                  <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                  </Spinner>
                ) : (
                  <BootstrapTable 
                    keyField='name' 
                    data={ playerData2 } 
                    columns={ columns2 }
                    striped
                    bordered={false}
                    wrapperClasses="table-responsive"
                  />
                )
              }
            </div>
          </Col>
        </Row>
        <Row className="App-container">
          <p className="App-sectionheader">
            Team Comparison
          </p>
        </Row>
        <Row className="App-container">
        { comparisonLoading ? (
                <Spinner animation="border" role="status">
                  <span className="sr-only">Loading...</span>
                </Spinner>
              ) : (
                <BootstrapTable 
                  keyField='name' 
                  data={ teamComparison } 
                  columns={ compareColumns }
                  striped
                  bordered={false}
                  wrapperClasses="table-responsive"
                />
              )
            }
        </Row>
      </Container>
      <footer className="App-footer">
        <p>
          Created by David Austin
        </p>
      </footer>
    </div>
  );
}

export default App;
