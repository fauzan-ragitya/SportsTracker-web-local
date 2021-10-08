import Head from "next/head";
// import Overview from '../components/Overview';
import { useAppState } from "../components/shared/AppProvider";
import { useEffect, useCallback, useState } from "react";
import { Row, Col, Form, Input, Select, Card, Button, Table } from "antd";
import { handleSessions } from "../utils/helpers";
import { FetcherGet } from "../utils/fetcher";

const ReportPage = ({ session }) => {
  const [_state, dispatch] = useAppState();

  /*=== Variable Dashboard ===*/
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataTableFull, setDataTableFull] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 0,
    total: 10,
  });

  /*=== Logic for fetch data table ===*/
  const fetchDataTable = async () => {
    setLoading(true);
    var result = await FetcherGet("http://localhost:5000/get_table_data",{
      headers:{ 
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      },
    });

    if (result?.status === 200) {
      setDataTable(result?.data?.data?.slice(0, 10) ?? []);
      setDataTableFull(result?.data?.data ?? []);
      setPagination({
        current: 1,
        pageSize: 10,
        total: result?.data?.data?.length + 1,
      });
    }
    setLoading(false);
  };

  /*=== Fetch data table first time ===*/
  useEffect(() => {
    fetchDataTable();
  }, []);

  /*=== Handle pagination login ===*/
  const handleTableChange = async (paginationA) => {
    const pager = { ...pagination };
    pager.current = paginationA.current;
    setPagination(pager);
    setDataTable(
      dataTableFull.slice((pager.current - 1) * 10, pager.current * 10)
    );
  };

  return (
    <>
      <Head>
        <title>Activities Report</title>
        <link rel="stylesheet" href="/react-vis.css" />
        <link rel="stylesheet" href="/css/home.css" />
        <link rel="stylesheet" href="/css/table.css" />
        <link rel="stylesheet" href="/css/component.css" />
      </Head>

      <Row>
        <Col xs={24} sm={24} md={24} lg={24}>
          <div className="pageTitle">Activities Report</div>
        </Col>
      </Row>

      <div style={{ height: "20px" }} />

      {/*=== Table View ===*/}
      <Table
        className="components-table-demo-nested"
        scroll={{ x: "100%" }}
        dataSource={dataTable}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      >
        <Table.Column
          title="No"
          key="index"
          width="5%"
          render={(value, item, index) =>
            (pagination.current - 1) * pagination.pageSize + index + 1
          }
        />
        <Table.Column
          title="Name"
          dataIndex="nama"
          render={(value, item, index) => value}
        />
        <Table.Column
          title="Work Out Pose"
          dataIndex="type"
          render={(value, item, index) => value}
        />
        <Table.Column
          title="Duration"
          dataIndex="durasi"
          render={(value, item, index) => value}
        />
        <Table.Column
          title="Total Count"
          dataIndex="count"
          render={(value, item, index) => value}
        />
        <Table.Column
          title="Average Time per Movement"
          dataIndex="time_per_movement"
          render={(value, item, index) => value}
        />
        <Table.Column
          title="Start Time"
          dataIndex="start_time"
          render={(value, item, index) => value}
        />
        <Table.Column
          title="End Time"
          dataIndex="end_time"
          render={(value, item, index) => value}
        />
      </Table>

      <div style={{ height: "120px" }} />
    </>
  );
};

export async function getServerSideProps(context) {
  let checkSessions = await handleSessions(context, false);
  return checkSessions;
}

export default ReportPage;
