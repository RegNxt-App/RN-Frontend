import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import Api from '../../../../utils/Api';

interface ValidationResponse {
  rulecount: number;
  totaltime: number;
  datafetchtime: number;
  dataupdates: number;
  rulecompilecount: number;
  rulecompileerrorcount: number;
  expressioncount: number;
  expressionerrorcount: number;
}

interface Toast {
  visible: boolean;
  data: ValidationResponse | null;
}

const Toast: React.FC<{ data: ValidationResponse }> = ({ data }) => (
  <div className="fixed top-4 right-4 z-50 animate-slide-left">
    <div className="min-w-[400px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {data.rulecompileerrorcount === 0 &&
            data.expressionerrorcount === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <h3 className="text-lg font-semibold">
              Validation{' '}
              {data.rulecompileerrorcount === 0 &&
              data.expressionerrorcount === 0
                ? 'Successful'
                : 'Completed with Errors'}
            </h3>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Time:</span>
            <span className="font-medium">{formatTime(data.totaltime)}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Data Fetch Time:</span>
            <span className="font-medium">
              {formatTime(data.datafetchtime)}s
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rules Count:</span>
            <span className="font-medium">{data.rulecount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Data Updates:</span>
            <span className="font-medium">{data.dataupdates}</span>
          </div>
          {(data.rulecompileerrorcount > 0 ||
            data.expressionerrorcount > 0) && (
            <div className="mt-2 text-red-500">
              {data.rulecompileerrorcount > 0 && (
                <div>Rule Compilation Errors: {data.rulecompileerrorcount}</div>
              )}
              {data.expressionerrorcount > 0 && (
                <div>Expression Errors: {data.expressionerrorcount}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-blue-500 transition-all duration-5000 ease-linear"
          style={{ width: '100%', animation: 'shrink 5s linear forwards' }}
        />
      </div>
    </div>
  </div>
);

export default Toast;
