// Result.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Result = () => {
    const { resultId } = useParams();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            const response = await axios.get(`/api/results/${resultId}`);
            setResult(response.data);
        };

        fetchResult();
    }, [resultId]);

    if (!result) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Result</h1>
            <div>Score: {result.score}%</div>
            <div>Date: {new Date(result.date).toLocaleString()}</div>
        </div>
    );
};

export default Result;
