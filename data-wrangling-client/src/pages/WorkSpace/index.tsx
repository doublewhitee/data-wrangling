import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CloseIcon from '@material-ui/icons/Close';

import { reqDatasetDetail } from '../../api/dataset';
import { reqHistoryList } from '../../api/history';
import message from '../../components/Message';
import Table from './Table';
import History from './History';

interface datasetInfo {
  _id: string,
  name: string,
  project: string,
  columns: {
    _id: string,
    name: string,
    datatype: string
  }[],
  rows: {
    row: object,
    _id: string
  }[]
}

interface history {
  _id: string,
  type: string,
  action: string,
  comment: string
}

const drawerWidth = 320

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(7),
    },
    [theme.breakpoints.up('sm')]: {
      marginTop: theme.spacing(8),
    },
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawer: {
    width: drawerWidth,
    maxWidth: '100vw',
    flexShrink: 0,
  },
  drawerPaper: {
    [theme.breakpoints.down('sm')]: {
      top: theme.spacing(7),
    },
    [theme.breakpoints.up('sm')]: {
      top: theme.spacing(8),
    },
    width: drawerWidth,
    maxWidth: '100vw',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
    height: 48,
  },
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
    marginTop: theme.spacing(6),
    height: `calc(100vh - 64px - 48px)`,
    overflowY: 'auto',
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));


const WorkSpace: React.FC = () => {
  const classes = useStyles()
  const navigate = useNavigate()
  const params = useParams()
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)
  // datasetInfo
  const [datasetInfo, setDatasetInfo] = useState<datasetInfo>()
  // active tab
  const [tabValue, setTabValue] = useState('summary')
  // history state
  const [historyList, setHistoryList] = useState<history[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)

  useEffect(() => {
    if (params.datasetId) {
      handleReqDatasetDetail()
    } else {
      message.error('Params error!')
    }
  }, [params.datasetId])

  useEffect(() => {
    handleReqHistoryList()
  }, [tabValue, currentPage])

  // req dataset detail
  const handleReqDatasetDetail = async () => {
    const res = await reqDatasetDetail(params.datasetId!)
    if (res && res.code === 200) {
      setDatasetInfo(res.data)
    } else {
      navigate('/project', { replace: true })
      message.error(res.message)
    }
  }

  // req history list
  const handleReqHistoryList = async () => {
    if (tabValue === 'history') {
      const res = await reqHistoryList(params.datasetId!, currentPage)
      if (res && res.code === 200) {
        setHistoryList(res.data)
        setTotalPage(Math.ceil(res.total / 10))
      } else {
        message.error(res.message)
      }
    }
  }

  // tab change
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue)
  }

  // back to detail page
  const handleBack = () => {
    if (datasetInfo && datasetInfo.project) {
      navigate(`/detail/${datasetInfo.project}`, { replace: true })
    } else {
      navigate('/project', { replace: true })
    }
  }

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        color="transparent"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: isDrawerOpen,
        })}
      >
        <Toolbar variant="dense">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setIsDrawerOpen(true)}
            edge="start"
            className={clsx(classes.menuButton, isDrawerOpen && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap className={classes.title}>
            {datasetInfo && datasetInfo.name ? datasetInfo.name : 'Dataset Name'}
          </Typography>
          <Button variant="outlined" color="primary">
            Export
          </Button>
          <IconButton color="inherit" onClick={handleBack}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={isDrawerOpen}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={() => setIsDrawerOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Column Info" value="summary" />
          <Tab label="History" value="history" />
        </Tabs>
        {/* todo */}
        {
          tabValue === 'summary' ? '' :
          <History
            historyList={historyList}
            currentPage={currentPage}
            totalPage={totalPage}
            setCurrentPage={setCurrentPage}
          />
        }
      </Drawer>

      <div
        className={clsx(classes.content, {
          [classes.contentShift]: isDrawerOpen,
        })}
      >
        <Table
          projectId={datasetInfo ? datasetInfo.project : ''}
          datasetId={datasetInfo ? datasetInfo._id : ''}
          columns={datasetInfo ? datasetInfo.columns : []}
          rows={datasetInfo ? datasetInfo.rows : []}
          onChangeSuccess={handleReqHistoryList}
          onRefresh={handleReqDatasetDetail}
        />
      </div>
    </div>
  );
};

export default WorkSpace;