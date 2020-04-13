
import { TextField } from '@tableau/tableau-ui';
import React, { useEffect, useState } from 'react';
import { Selector } from '../shared/Selector';
import { HierarchyProps, Status } from './Interfaces';
const extend=require('extend');
import arrayMove from 'array-move';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { Button as RSButton, Col, Container, Row } from 'reactstrap';
import dragHandle from '../../images/Drag-handle-01.png';

interface Props {
    data: HierarchyProps;
    setUpdates: (obj: { type: string, data: any; }) => void;

    setCurrentWorksheetName: (s: string) => void;
}

export function Page2Flat(props: Props) {
    // fieldArr is all fields on current worksheet
    const [fieldArr, setFieldArr]=useState<string[]>([]);
    // availFields are fields on worksheet that are not added to hierarchy (aka worksheet.fields); used for childID selector
    const [availFields, setAvailFields]=useState<string[]>([]);
    // sans child is all available fields except child id field; used for left ul
    const [availFieldsSansChildId, setAvailFieldsSansChildId]=useState<string[]>([]);

    useEffect(() => {
        setFieldArr(props.data.dashboardItems.allCurrentWorksheetItems.fields.map(field => field));
    }, [props.data.dashboardItems.allCurrentWorksheetItems.fields, props.data.worksheet.childId]);

    useEffect(() => {
        const avail: string[]=[];
        const sansChildId: string[]=[];
        // tslint:disable prefer-for-of
        for(let i=0;i<fieldArr.length;i++) {
            if(props.data.worksheet.fields.indexOf(fieldArr[i])===-1 ) {
                avail.push(fieldArr[i]);
                if (fieldArr[i] !== props.data.worksheet.childId){
                    sansChildId.push(fieldArr[i]);
                }
            }
        }
        // tslint:enable prefer-for-of
        setAvailFields(avail);
        setAvailFieldsSansChildId(sansChildId);
    }, [fieldArr, props.data.worksheet.fields, props.data.worksheet.childId]);

    // Handles selection in worksheet selection dropdown
    const worksheetChange=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        props.setCurrentWorksheetName(e.target.value);
    };

    const setChild=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        props.setUpdates({ type: 'SETCHILDIDFIELD', data: e.target.value });
    };


    const worksheetTitle=() => {
        switch(props.data.worksheet.status) {
            case Status.notpossible:
                return 'No valid sheets on the dashboard';
            case Status.set:
            case Status.notset:
                return 'Select the sheet with the hierarchy data';
            default:
                return '';
        }
    };
    const DragHandle=(() => <img src={dragHandle} width='25px' height='25px' />);
    const SortableItem=SortableElement(({ value }: any) => <li><DragHandle />{value}
        <RSButton value={value} onClick={removeFromList} color='white' size='xs' style={{ color: 'red' }}>X</RSButton>
    </li>);

    const SortableList=SortableContainer(({ items }: any) => {
        console.log(`sortable list recevied ${ JSON.stringify(items) }`);
        if(!items) { return (<li>No items</li>); }
        return (
            <ul className={'sortableList'}>
                {items.map((value: any, index: any) => (
                    <SortableItem key={`item-${ value }`} index={index} value={value} />
                ))}
            </ul>
        );
    });

    const StaticFieldsItem=SortableElement(({ value }: any) => <li>{value}
        <RSButton value={value} onClick={addToList} color='white' size='xs' style={{ color: 'blue' }}>Add</RSButton>
        {/* <RSButton value={value} onClick={props.setChild} color='white' size='xs' style={{ color: 'blue' }}>Key</RSButton> */}
    </li>);

    const StaticFieldsList=SortableContainer(({ items }: any) => {
        console.log(`static list recevied ${ JSON.stringify(items) }`);
        if(!items) { return (<li>No items</li>); }
        return (
            <ul className={'sortableList'}>
                {items.map((value: any, index: any) => (
                    <StaticFieldsItem key={`item-${ value }`} index={index} value={value} />
                ))}
            </ul>
        );
    });

    // sort lists
    const onSortEnd=({ oldIndex, newIndex }: any) => {
        console.log(`onSortEnd: ${ JSON.stringify(props.data.worksheet.fields) } - ${ oldIndex }->${ newIndex }`);
        const newOrder=arrayMove(props.data.worksheet.fields, oldIndex, newIndex);
        console.log(`newOrder: ${ JSON.stringify(newOrder) }`);
        // const _st=extend(true, {}, props.data);
        // _st.worksheet.fields=newOrder;
        // props.setStatePassThru({ selectedProps: _st });
        // props.dispatchSelectedProps({ type: 'worksheetProps', data: { fields: newOrder } });
        props.setUpdates({ type: 'SETFIELDS', data: newOrder });
    };

    // remove from list
    const removeFromList=(evt: any) => {
        console.log(`trying to remove ${ evt.target.value }`);
        const filteredItems=props.data.worksheet.fields.filter((item: string) => {
            return item!==evt.target.value;
        }
        );
        console.log(`items now: ${ filteredItems }`);
        // const _selectedProps=extend(true, {}, props.data);
        // _selectedProps.worksheet.fields=filteredItems;

        // props.setStatePassThru({ selectedProps: _selectedProps });
        // props.dispatchSelectedProps({ type: 'replaceFields', data: filteredItems });
        props.setUpdates({ type: 'SETFIELDS', data: filteredItems });
    };

    // add to list
    const addToList=(evt?: any) => {
        const fields: string[]=extend(true, [], props.data.worksheet.fields);
        // if(!_selectedProps.worksheet.hasOwnProperty('fields')) { _selectedProps.worksheet.fields=[]; }
        console.log(`evt?  target.value ${ evt.target.value }`);
        console.log(evt);
        if(evt.target&&evt.target.value) {
            fields.push(evt.target.value);
        }
        else {
            fieldArr.forEach(el => {
                if(fields.indexOf(el)===-1&&el!==props.data.worksheet.childId) {
                    fields.push(el);
                }
            });
        }
        // props.setStatePassThru({ selectedProps: _selectedProps });

        // props.dispatchSelectedProps({ type: 'worksheetProps', data: { fields } });
        props.setUpdates({ type: 'SETFIELDS', data: fields });
    };
    const inputProps={
        errorMessage: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        label: `Separator for ${ props.data.worksheet.childId } field formula.`,
        onChange: (e: any) => {
            // const _selectedProps: SelectedProps=extend(true, {}, props.data);
            // _selectedProps.seperator=e.target.value;
            // props.dispatchSelectedProps({ type: 'seperator', data: e.target.value });
            props.setUpdates({ type: 'SETSEPERATOR', data: e.target.value });
        },
        onClear: () => {
            // const _selectedProps: SelectedProps=extend(true, {}, props.data);
            // _selectedProps.seperator='|';
            // props.dispatchSelectedProps({ type: 'seperator', data: '|' });
            props.setUpdates({ type: 'SETSEPERATOR', data: '|' });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: props.data.seperator,
    };

    const formula=() => {
        let f='';
        for(let i=0;i<props.data.worksheet.fields.length;i++) {
            f+=`[${ props.data.worksheet.fields[i] }]`;
            if(i<props.data.worksheet.fields.length-1) {
                f+=`+'${ props.data.seperator }'+`;
            }
        }
        return f;
    };

    return (
        <div className='sectionStyle mb-5'>
            <b>Worksheet and Fields</b>
            <p />
            <Selector
                title={worksheetTitle()}
                status={props.data.worksheet.status}
                selected={props.data.worksheet.name}
                list={props.data.dashboardItems.worksheets}
                onChange={worksheetChange}
            />
            <Selector
                title='ID Column'
                status={availFields.length>0? Status.set:Status.hidden}
                list={availFields}
                onChange={setChild}
                selected={props.data.worksheet.childId}
            />
            <TextField {...inputProps} />
            <br />
            <div style={{ marginLeft: '9px' }}>
                The source sheet for the hierarchy should have the {props.data.worksheet.childId} field with the below formula.  If it does not, please add/edit it and re-configure the extension:
                <br />
                <span style={{ fontStyle: 'italic', marginLeft: '5px' }}>{`   ${ formula() }`}</span>
            </div>
            <br />
            <Container style={{ border: '1px solid #e6e6e6', padding: '1px', marginLeft: '9px' }}>
                <Row>

                    <Col>
                        {props.data.worksheet.fields&&props.data.worksheet.fields.length?
                            <div>Hierarchy fields (in order)
                <SortableList
                                    items={props.data.worksheet.fields}
                                    onSortEnd={onSortEnd}
                                    lockAxis='y'
                                    helperClass={'draggingSort'}
                                />
                            </div>
                            :<span style={{ border: '1px solid #e6e6e6', padding: '1px' }}>No fields in hierarchy.</span>}
                    </Col>
                    <Col xs='auto'>
                        <RSButton onClick={addToList} color='primary' size='xs' disabled={!availFieldsSansChildId.length}>{`<<`}</RSButton>
                    </Col>
                    <Col>
                        {availFieldsSansChildId.length>0?
                            <>
                                <StaticFieldsList
                                    items={availFieldsSansChildId}
                                    onSortEnd={onSortEnd}
                                    lockAxis='y'
                                    helperClass={'draggingSort'}
                                />

                            </>
                            :fieldArr.length?'All fields are used':'No fields available'}
                        <p />

                    </Col>
                </Row>
            </Container>
        </div>);
}