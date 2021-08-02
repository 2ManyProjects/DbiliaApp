import "./App.css";
import React, { useState, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import debounce from "lodash.debounce";

import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  searchBar: {
    borderWidth: "1px",
    width: "60%",
    height: "50%",
  },
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  innerLayer: {
    display: "flex",
    flexDirection: "column",
    border: "4px solid #000000",
    justifyContent: "center",
    width: "60%",
    backgroundColor: "green",
    alignItems: "center",
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
}));

function App() {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState([]);
  const [query, setQuery] = useState(null);
  const classes = useStyles();

  // The following 3 functions would be in the backend, with the frontend just passing the query
  // onwards, and the backend fetching the secret Key, formating the Twitch request and returning the data
  // fetched from Twitch to the frontend. Normally the frontend should never have direct access to any API / security keys
  async function fetchTwitchData(string) {
    const API_KEY = await fetchKeySecurely();
    let webApiUrl =
      "https://api.twitch.tv/helix/search/channels?query=" + string;
    let data = await axios.get(webApiUrl, {
      headers: {
        "Client-Id": `32fyveq0ijao3rp00hzi2l86bg5n6m`, //Should never be exposed on the frontend
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    console.log(data.data);
    let pagination = data.pagination;
    let list = data.data.data;
    let temp = [];
    for (let x = 0; x < list.length; x++) {
      let obj = {
        value: list[x].display_name, //broadcaster_login
        label: list[x].display_name,
        data: list[x],
      };
      temp.push(obj);
    }
    setResult(temp);
  }

  async function serverDelay(stallTime = 3000) {
    await new Promise((resolve) => setTimeout(resolve, stallTime));
  }
  var fetchKeySecurely = async () => {
    var data = "wmv1l0yuvhv6demmb3myd6p1ss29pi"; //Should never be exposed on the frontend
    await serverDelay(500);
    return data;
  };

  const verify = useCallback(
    debounce((username) => {
      if (username && username.length > 2) fetchTwitchData(username);
    }, 1000),
    []
  );

  const handleQuery = (data) => {
    setQuery(data);
    verify(data);
  };

  return (
    <div className={classes.container}>
      <div className={classes.innerLayer}>
        <div className={classes.searchBar}>
          <Select
            defaultValue={selected}
            onChange={setSelected}
            onInputChange={handleQuery}
            options={result}
          />
        </div>
        {selected && selected.value.length > 1 && (
          <Card className={classes.root}>
            <CardHeader
              avatar={<Avatar alt="new" src={selected.data.thumbnail_url} />}
              title={
                selected.data.display_name +
                " (" +
                selected.data.broadcaster_language +
                ")"
              }
              subheader={selected.data.is_live ? "LIVE" : "not live"}
            />
            <CardContent>
              <Typography color="textSecondary" component="p">
                {selected.data.title}
              </Typography>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
