// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { Row, Col } from 'antd/lib/grid';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';

import getCore from 'cvat-core-wrapper';
import { updateProjectAsync } from 'actions/projects-actions';
import LabelsEditor from 'components/labels-editor/labels-editor';
import BugTrackerEditor from 'components/task-page/bug-tracker-editor';
import UserSelector from 'components/task-page/user-selector';
import { Anchor, Button } from 'antd';

const core = getCore();

interface DetailsComponentProps {
    project: any;
    tasksValue: any;
}

export default function DetailsComponent(props: DetailsComponentProps): JSX.Element {
    const { project, tasksValue } = props;

    const dispatch = useDispatch();
    const [projectName, setProjectName] = useState(project.name);
    const [loading, setLoading] = useState(false);
    const enterLoading = index => {
		setLoading(true);
			fetch('https://data.drill-d.co.il/generatejson.php?project_id='+index+'&tasks_id='+tasksValue)
			.then(resp => resp.blob())
			.then(blob => {
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href = url;
				// the filename you want
				a.download = projectName+new Date().getTime()+'.json';
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				setLoading(false);
			})
			.catch((err) => console.log(err));
  	};


    return (
        <div cvat-project-id={project.id} className='cvat-project-details'>
            <Row>
                <Col>
                    <Title
                        level={4}
                        editable={{
                            onChange: (value: string): void => {
                                setProjectName(value);
                                project.name = value;
                                dispatch(updateProjectAsync(project));
                            },
                        }}
                        className='cvat-text-color cvat-project-name'
                    >
                        {projectName}
                    </Title>
                    {tasksValue.length === 0?
                        <Button
                        type="primary"
                        loading={loading}
                        onClick={() => enterLoading(project.id)}
                      >
                       Download JSON
                      </Button>:

                        <Button
                        type="primary"
                        loading={loading}
                        onClick={() => enterLoading(project.id)}
                      >
                       Download Selected Tasks
                      </Button>}
                </Col>
            </Row>
            <Row justify='space-between' className='cvat-project-description'>
                <Col>
                    <Text type='secondary'>
                        {`Project #${project.id} created`}
                        {project.owner ? ` by ${project.owner.username}` : null}
                        {` on ${moment(project.createdDate).format('MMMM Do YYYY')}`}
                    </Text>
                    <BugTrackerEditor
                        instance={project}
                        onChange={(bugTracker): void => {
                            project.bugTracker = bugTracker;
                            dispatch(updateProjectAsync(project));
                        }}
                    />
                </Col>
                <Col>
                    <Text type='secondary'>Assigned to</Text>
                    <UserSelector
                        value={project.assignee}
                        onSelect={(user) => {
                            project.assignee = user;
                            dispatch(updateProjectAsync(project));
                        }}
                    />
                </Col>
            </Row>
            <LabelsEditor
                labels={project.labels.map((label: any): string => label.toJSON())}
                onSubmit={(labels: any[]): void => {
                    project.labels = labels.map((labelData): any => new core.classes.Label(labelData));
                    dispatch(updateProjectAsync(project));
                }}
            />
        </div>
    );
}
