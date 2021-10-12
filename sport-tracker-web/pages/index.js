import Head from "next/head";
// import Overview from '../components/Overview';
import { useAppState } from "../components/shared/AppProvider";
import { useEffect, useCallback, useState } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Select,
  Card,
  Button,
  notification,
} from "antd";
import { handleSessions } from "../utils/helpers";
import { isBrowser } from "../utils/helpersBrowser";
import moment from "moment";
import { FetcherPost } from "../utils/fetcher";

const OverviewPage = ({ session }) => {
  const [_state, dispatch] = useAppState();

  /*=== Variable Dashboard ===*/
  const [countdown, setCountdown] = useState(0);
  const [startClicked, setStartClicked] = useState(false);
  const [count, setCount] = useState(0);
  const [videoSource, setVideoSource] = useState("video_feed");
  const [isDone, setIsDone] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [name, setName] = useState("");
  const [option, setOption] = useState(null);
  const [duration, setDuration] = useState("00:00");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  /*=== Notification Logic ===*/
  const openNotification = () => {
    notification.error({
      message: "Error",
      description: "Please fill the name and select an option",
    });
  };

  /*=== Start Activity Logic ===*/
  const startActivity = useCallback(() => {
    if (option && name !== "") {
      setStartClicked(true);
      setCount(0);
      setConfidence(0);
      setIsDone(false);
      var i = 11;
      let timerId = setInterval(() => {
        i = i - 1;
        setCountdown(i);
      }, 1000);

      /*=== Do fetch video and others data after countdown is done ===*/
      setTimeout(() => {
        clearInterval(timerId);

        /*=== Do the timer logic and other things to do here ===*/
        setStartTime(moment().format('HH:mm'))
        setCountdown(0);
        var dur = 60;
        switch (option) {
          case "pushup":
            setVideoSource("video_feed_pushup");
            break;
          case "situp":
            setVideoSource("video_feed_situp");
            break;
          case "pullup":
            setVideoSource("video_feed_pullup");
            break;
          default:
            break;
        }
        let timerActivity = setInterval(() => {
          var durations = moment
            .utc(moment.duration(dur, "seconds").as("milliseconds"))
            .format("mm:ss");
          dur = dur - 1;
          setDuration(durations);
        }, 1000);
        setTimeout(() => {
          clearInterval(timerActivity);
          setIsDone(true);
          setStartClicked(false);
          setConfidence(0);
          setEndTime(moment().format('HH:mm'))
          setVideoSource("video_feed");
        }, 61000);
        /*=== End of Timer Logic ===*/
      }, 11000);
    } else {
      openNotification();
    }
  });

  /*=== Save Activity Logic ===*/
  const saveActivity = async() => {
    var result = await FetcherPost("http://localhost:5000/save_data", {
      nama: name,
      type: option,
      durasi: "1 Minute",
      count: count,
      time_per_movement: !count ? 60/count : "-",
      start_time: startTime,
      end_time: endTime
    })

    if (result?.status === 200) {
      notification.success({
        message: "Success",
        description: "Success saving the data",
      });
    }else{
      notification.error({
        message: "Error",
        description: "Failed to save data",
      });
    }
  };

  /*=== Use Effect for Websocket ===*/
  useEffect(() => {
    // console.log(moment(startTime, "HH:mm").add(1,'minutes').format('HH:mm'))
    if (isBrowser) {
      const socket = new WebSocket("ws://127.0.0.1:7500/ws/1/");
      socket.addEventListener("message", function (event) {
        var data = JSON.parse(JSON.parse(event.data).message);
        if(data.count !== count){
          setCount(data.count);
        }
        if(data.conf !== confidence){
          setConfidence(data.conf);
        }
      });
      return () => {
        if (isBrowser) {
          socket.close();
        }
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard Sport Tracker</title>
        <link rel="stylesheet" href="/react-vis.css" />
        <link rel="stylesheet" href="/css/home.css" />
      </Head>

      <Row>
        <Col xs={24} sm={24} md={24} lg={24}>
          <div className="pageTitle">Dashboard</div>
        </Col>
      </Row>

      <div style={{ height: "20px" }} />

      {/*=== Option and Select ===*/}
      <Form style={{ width: "100%" }}>
        <Row gutter={[20, 20]} align="middle">
          <Col xs={24} sm={24} md={6} lg={6}>
            <p style={{ margin: 0, fontWeight: "700", fontSize: "14px" }}>
              Name
            </p>
            <Form.Item name="name" style={{ marginBottom: 0, width: "100%" }}>
              <Input
                type="text"
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6}>
            <p style={{ margin: 0, fontWeight: "700", fontSize: "14px" }}>
              Option
            </p>
            <Select
              placeholder="Select an option"
              style={{ width: "100%" }}
              onChange={(e) => setOption(e)}
              allowClear
            >
              <Select.Option value="pushup">Push Up</Select.Option>
              <Select.Option value="situp">Sit Up</Select.Option>
              <Select.Option value="pullup">Pull Up</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6}>
            <p style={{ margin: 0, fontWeight: "700", fontSize: "14px" }}>
              Duration
            </p>
            <Select
              placeholder="Select a duration"
              value="60"
              style={{ width: "100%" }}
              allowClear
            >
              <Select.Option value="30">30 seconds</Select.Option>
              <Select.Option value="60">1 minute</Select.Option>
              <Select.Option value="90">1 minute 30 seconds</Select.Option>
            </Select>
          </Col>
        </Row>
      </Form>

      <div style={{ height: "20px" }} />

      {/*=== View Image, Count and Other data ===*/}
      <Row gutter={[10, 10]}>
        <Col xs={24} sm={24} md={16} lg={16}>
          <div
            style={{
              backgroundColor: "black",
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {countdown !== 0 && (
              <div className="countdownContainer">
                <div className="countdownText">{countdown}</div>
              </div>
            )}
            <div className="buttonStartDashboard">
              {
                endTime 
                ? (
                  <Row gutter={[20,20]}>
                    <Button onClick={saveActivity} type="primary" danger>
                      Save
                    </Button>
                    <div style={{width:'20px'}}/>
                    <Button onClick={startActivity} type="primary" danger>
                      Try Again
                    </Button>
                  </Row>
                )
                : !startClicked && (
                    <Button onClick={startActivity} type="primary" danger>
                      Start Capture
                    </Button>
                )
              }
            </div>
            <img
              src={`http://127.0.0.1:5000/${videoSource}`}
              alt={"image"}
              style={{ width: "100%", minHeight:'200px' }}
            />
          </div>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8}>
          <Card
            style={{
              backgroundColor: "#FA5B5A",
              borderRadius: "20px",
              backgroundImage: "url(/images/logo/cardBG.svg)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center center",
            }}
          >
            <center>
              <div className="cardCountTitle">Count</div>
              <div className="cardCountSubtitle">{count}</div>
            </center>
          </Card>
          <div style={{ height: "10px" }} />
          <Card style={{ borderRadius: "20px" }}>
            <Row gutter={[10, 10]} justify="center" align="middle">
              <Col
                xs={10}
                sm={10}
                md={10}
                lg={10}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <img src="images/icon/timeIcon.svg" alt={"time_icon"}/>
              </Col>
              <Col xs={14} sm={14} md={14} lg={14}>
                <div className="cardSmallTitle">Time</div>
                <div className="cardSmallSubtitle">{duration}</div>
              </Col>
            </Row>
          </Card>
          <div style={{ height: "10px" }} />
          <Card style={{ borderRadius: "20px" }}>
            <Row gutter={[10, 10]} justify="center" align="middle">
              <Col
                xs={10}
                sm={10}
                md={10}
                lg={10}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <img src="images/icon/confidenceIcon.svg" alt={"confi_icon"}/>
              </Col>
              <Col xs={14} sm={14} md={14} lg={14}>
                <div className="cardSmallTitle">Confidence Level</div>
                <div className="cardSmallSubtitle">
                  {confidence}
                  {"%"}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <div style={{ height: "120px" }} />
    </>
  );
};

export async function getServerSideProps(context) {
  let checkSessions = await handleSessions(context, false);
  return checkSessions;
}

export default OverviewPage;
