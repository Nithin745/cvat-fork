// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CombinedState, Task } from 'reducers/interfaces';
import { useParams, useHistory  } from 'react-router-dom';
import { Col } from 'antd/lib/grid';
import Icon, { StopOutlined, CheckCircleOutlined, FastForwardOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import Timeline from 'antd/lib/timeline';
import Dropdown from 'antd/lib/dropdown';

import AnnotationMenuContainer from 'containers/annotation-page/top-bar/annotation-menu';
import {
    MainMenuIcon, SaveIcon, UndoIcon, RedoIcon,
} from 'icons';
import { ActiveControl, ToolsBlockerState } from 'reducers/interfaces';
import CVATTooltip from 'components/common/cvat-tooltip';
import getCore from 'cvat-core-wrapper';
const core = getCore();

interface Props {
    saving: boolean;
    savingStatuses: string[];
    undoAction?: string;
    redoAction?: string;
    saveShortcut: string;
    undoShortcut: string;
    redoShortcut: string;
    drawShortcut: string;
    switchToolsBlockerShortcut: string;
    toolsBlockerState: ToolsBlockerState;
    activeControl: ActiveControl;
    onSaveAnnotation(): void;
    onUndoClick(): void;
    onRedoClick(): void;
    onFinishDraw(): void;
    onSwitchToolsBlockerState(): void;
}

function LeftGroup(props: Props): JSX.Element {
    const {
        saving,
        savingStatuses,
        undoAction,
        redoAction,
        saveShortcut,
        undoShortcut,
        redoShortcut,
        drawShortcut,
        switchToolsBlockerShortcut,
        activeControl,
        toolsBlockerState,
        onSaveAnnotation,
        onUndoClick,
        onRedoClick,
        onFinishDraw,
        onSwitchToolsBlockerState,
    } = props;

    const includesDoneButton = [
        ActiveControl.DRAW_POLYGON,
        ActiveControl.DRAW_POLYLINE,
        ActiveControl.DRAW_POINTS,
        ActiveControl.AI_TOOLS,
        ActiveControl.OPENCV_TOOLS,
    ].includes(activeControl);

    const includesToolsBlockerButton =
        [ActiveControl.OPENCV_TOOLS, ActiveControl.AI_TOOLS].includes(activeControl) && toolsBlockerState.buttonVisible;

    const shouldEnableToolsBlockerOnClick = [ActiveControl.OPENCV_TOOLS].includes(activeControl);
    const tasks = useSelector((state: CombinedState) => state.tasks.current);
    const { tid } = useParams();
    const currTask = tasks.filter(element => element.instance.id == tid);
    const history = useHistory();
    const redirectURL = () => {
        core.projects.get({ id: currTask[0].instance.projectId, withoutTasks: true,  task_id: currTask[0].instance.id}).then((response:ProjectPartialWithSubsets[]) => {
            response[0].next_task !== null?history.push("/tasks/"+response[0].next_task.id+"/jobs/"+response[0].next_task.segments[0].jobs[0].id):'';
        });
        //currTask[0].instance.next_task !== null?
        //history.push("/tasks/"+currTask[0].instance.next_task.id+"/jobs/"+currTask[0].instance.next_task.segments[0].jobs[0].id):'';
    };

    return (
        <>
            <Modal title='Saving changes on the server' visible={saving} footer={[]} closable={false}>
                <Timeline pending={savingStatuses[savingStatuses.length - 1] || 'Pending..'}>
                    {savingStatuses.slice(0, -1).map((status: string, id: number) => (
                        <Timeline.Item key={id}>{status}</Timeline.Item>
                    ))}
                </Timeline>
            </Modal>
            <Col className='cvat-annotation-header-left-group'>
                <Dropdown overlay={<AnnotationMenuContainer />}>
                    <Button type='link' className='cvat-annotation-header-button'>
                        <Icon component={MainMenuIcon} />
                        Menu
                    </Button>
                </Dropdown>
                <CVATTooltip overlay={`Save current changes ${saveShortcut}`}>
                    <Button
                        onClick={saving ? undefined : onSaveAnnotation}
                        type='link'
                        className={saving ? 'cvat-annotation-disabled-header-button' : 'cvat-annotation-header-button'}
                    >
                        <Icon component={SaveIcon} />
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </CVATTooltip>
                <CVATTooltip overlay={`Undo: ${undoAction} ${undoShortcut}`}>
                    <Button
                        style={{ pointerEvents: undoAction ? 'initial' : 'none', opacity: undoAction ? 1 : 0.5 }}
                        type='link'
                        className='cvat-annotation-header-button'
                        onClick={onUndoClick}
                    >
                        <Icon component={UndoIcon} />
                        <span>Undo</span>
                    </Button>
                </CVATTooltip>
                <CVATTooltip overlay={`Redo: ${redoAction} ${redoShortcut}`}>
                    <Button
                        style={{ pointerEvents: redoAction ? 'initial' : 'none', opacity: redoAction ? 1 : 0.5 }}
                        type='link'
                        className='cvat-annotation-header-button'
                        onClick={onRedoClick}
                    >
                        <Icon component={RedoIcon} />
                        Redo
                    </Button>
                </CVATTooltip>
                <CVATTooltip overlay={`Next Task`}>
            <Button
                    type='link'
                    className='cvat-annotation-header-button'
                    onClick={redirectURL}
                >
                <FastForwardOutlined />
                   Next Task
                </Button>
                </CVATTooltip>

                {includesDoneButton ? (
                    <CVATTooltip overlay={`Press "${drawShortcut}" to finish`}>
                        <Button type='link' className='cvat-annotation-header-button' onClick={onFinishDraw}>
                            <CheckCircleOutlined />
                            Done
                        </Button>
                    </CVATTooltip>
                ) : null}
                {includesToolsBlockerButton ? (
                    <CVATTooltip overlay={`Press "${switchToolsBlockerShortcut}" to postpone running the algorithm `}>
                        <Button
                            type='link'
                            className={`cvat-annotation-header-button ${
                                toolsBlockerState.algorithmsLocked ? 'cvat-button-active' : ''
                            }`}
                            onClick={shouldEnableToolsBlockerOnClick ? onSwitchToolsBlockerState : undefined}
                        >
                            <StopOutlined />
                            Block
                        </Button>
                    </CVATTooltip>
                ) : null}
            </Col>
        </>
    );
}

export default React.memo(LeftGroup);
