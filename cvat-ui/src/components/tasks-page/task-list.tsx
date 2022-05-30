// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'antd/lib/grid';
import Pagination from 'antd/lib/pagination';
import Title from 'antd/lib/typography/Title';
import { Checkbox } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { CombinedState, Project } from 'reducers/interfaces';
import { getProjectsAsync } from 'actions/projects-actions';
import ModelRunnerModal from 'components/model-runner-modal/model-runner-dialog';
import MoveTaskModal from 'components/move-task-modal/move-task-modal';
import TaskItem from 'containers/tasks-page/task-item';
import { Form, Anchor, Button, Select } from 'antd';
import { pushTaskIds, removeTaskIds } from 'actions/tasks-actions';
import { DatePicker, Space } from 'antd';
import moment from 'moment';

export interface Props {
    currentTasksIndexes: number[];
    onAdvancedFilter(projectId: number, status: string, fromDate: string, toDate: string): void;
}

function TaskListComponent(props: Props): JSX.Element {
    const { currentTasksIndexes, onAdvancedFilter} = props;
    const { RangePicker } = DatePicker;
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getProjectsAsync());
    }, []);
    const projectInstances = useSelector((state: CombinedState) => state.projects.current);
    const task_Status = [{displayName: 'Completed', valueDB:'completed'}, {displayName:'Pending', valueDB:'annotation'}, {displayName:'Validation', valueDB:'validation'}];

    const taskViews = currentTasksIndexes.map((tid, id): JSX.Element => <TaskItem idx={id} taskID={tid} key={tid} />);
    const idOptions = currentTasksIndexes.map((tid, id): index => tid)
    const [csvloading, setcsvLoading] = useState(false);
    const [jsonloading, setjsonLoading] = useState(false);
    const [submitloading, setsubmitLoading] = useState(false);
    const tasks_id = useSelector((state: CombinedState): any => state.tasks.tasks_id);
      const [checkedList, setCheckedList] = React.useState(tasks_id);
      const newArr = new Set(idOptions);
      var task_removed = tasks_id.filter((elem)=>{
          return !newArr.has(elem);
      });

      var task_added = tasks_id.filter((elem)=>{
        return newArr.has(elem);
      });
      const [indeterminate, setIndeterminate] = React.useState(!!task_added.length && task_added.length < idOptions.length);
      const [checkAll, setCheckAll] = React.useState(task_added.length === idOptions.length);
      const onChange = checkedValues => {
          setIndeterminate(!!checkedValues.length && checkedValues.length < idOptions.length);
          setCheckAll(checkedValues.length === idOptions.length);
          var newArray = [];
          newArray.push(...task_removed);
          newArray.push(...checkedValues);
          var taskArray = [];
          taskArray = newArray.filter((elem, pos) => {
                return newArray.indexOf(elem) == pos;
            });
          dispatch(pushTaskIds(taskArray));
          setCheckedList(taskArray);
      };
      const onCheckAllChange = e => {
            var newArray = [];
            newArray.push(...task_removed);
            newArray.push(...idOptions);
            var taskArray = [];
            taskArray = newArray.filter((elem, pos) => {
              return newArray.indexOf(elem) == pos;
            });
          setCheckedList(e.target.checked ? taskArray : task_removed);
          dispatch(pushTaskIds(e.target.checked ? taskArray : task_removed));
          setIndeterminate(false);
          setCheckAll(e.target.checked);
        };
        const urlParams = new URLSearchParams(window.location.search);
        const selprojid = urlParams.get('project_id')?urlParams.get('project_id'):0;
        const selprostat = urlParams.get('status')?urlParams.get('status'):'';
        let selfrom, selto;
        if(selprostat == 'completed'){
            selfrom = urlParams.get('updated_date_after')?urlParams.get('updated_date_after'):'';
            selto = urlParams.get('updated_date_before')?urlParams.get('updated_date_before'):'';
        }else{
            selfrom = urlParams.get('created_date_after')?urlParams.get('created_date_after'):'';
            selto = urlParams.get('created_date_before')?urlParams.get('created_date_before'):'';
        }

    const enterLoading = () => {
        setjsonLoading(true);
            fetch('http://192.168.1.202:81/generatetaskjson.php?tasks_id='+tasks_id+'&project_id='+selprojid+'&status='+selprostat+'&fromDate='+selfrom+'&toDate='+selto)
            .then(resp => resp.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                // the filename you want
                a.download = 'Selected_Tasks_' + new Date().getTime()+'.json';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                setjsonLoading(false);
                dispatch(removeTaskIds())
            })
            .catch((err) => console.log(err));
      };
      const downloadPHP = () => {
        setcsvLoading(true);
        console.log('download php')
            fetch('http://192.168.1.202:81/downloadvideos.php')
            .then(resp => resp.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                // the filename you want
                a.download = 'engine_video_' + new Date().getTime()+'.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                setcsvLoading(false);
                console.log('inside download response')
                dispatch(removeTaskIds());
            })
            .catch((err) => console.log(err));
      };
      const [projectId, setProjectId]=React.useState(selprojid?Number(selprojid):0);
      const defaultProjectId = selprojid?Number(selprojid):null;
      const [pro_status, setStatus]=React.useState(selprostat?selprostat:'');
      const [pro_date, setproDate]=React.useState([selfrom,selto]);
      const onProjectChange = e => {
          setProjectId(e);
      };
      const onStatusChange = e => {
          setStatus(e);
      };
      const onDateChange = (value, dateString)  => {
          setproDate(dateString)
      };
      const clickAction = e =>{
        onAdvancedFilter(projectId, pro_status, pro_date[0], pro_date[1]);
    }
    return (
        <>
        <Row className='cvat-tasks-page-top-bar' justify='center' align='middle' style={{ height: '10%' }} >
            <Col md={22} lg={18} xl={16} xxl={14}>
                <Row justify='space-between' align='bottom'>
                    <Col>
                    <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                    <Title level={3} style={{ display: "inline"}}>Tasks</Title></Checkbox>
                    </Col>
					<Col>
                        <Row gutter={8}>
                            <Col>
                            <Button
                        type="primary"
                        loading={jsonloading}
                        onClick={() => enterLoading()}
                      >
                       Download JSON
                      </Button> &nbsp;&nbsp;
                      <Button
                        type="primary"
                        loading={csvloading}
                        onClick={() => downloadPHP()}
                      >
                       Download CSV
                      </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        </Row>

         <Checkbox.Group style={{ width: '100%' }} onChange={onChange} value={checkedList} >
            <Row justify='center' align='middle'>
                <Col className='cvat-tasks-list' md={22} lg={18} xl={16} xxl={14}>
                    {taskViews}
                </Col>
            </Row>
            </Checkbox.Group>
            <ModelRunnerModal />
            <MoveTaskModal />
        </>
    );
}

export default React.memo(TaskListComponent, (prev: Props, cur: Props) => (
    prev.currentTasksIndexes.length !== cur.currentTasksIndexes.length || prev.currentTasksIndexes
        .some((val: number, idx: number) => val !== cur.currentTasksIndexes[idx])
));
