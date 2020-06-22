import React from 'react';
import { Tag } from 'rsuite';

// TO DO rendre dynamique : Ajouter les couleurs du tag en fonction des data du back

const StatusTag = ({ color, text }) => (
    <Tag color={color}> {text.toUpperCase()} </Tag>
);
export default StatusTag;