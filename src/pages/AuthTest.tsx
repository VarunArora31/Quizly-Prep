import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthTest() {
  const [urlInfo, setUrlInfo] = useState({
    href: '',
    search: '',
    hash: '',
    params: {} as Record<string, string>,
    hashParams: {} as Record<string, string>
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const params: Record<string, string> = {};
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    
    const hashParamsObj: Record<string, string> = {};
    hashParams.forEach((value, key) => {
      hashParamsObj[key] = value;
    });
    
    setUrlInfo({
      href: window.location.href,
      search: window.location.search,
      hash: window.location.hash,
      params,
      hashParams: hashParamsObj
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Auth URL Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Full URL:</h3>
            <p className="text-sm font-mono bg-muted p-2 rounded break-all">{urlInfo.href}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Search Parameters:</h3>
            <p className="text-sm font-mono bg-muted p-2 rounded">{urlInfo.search || 'None'}</p>
            {Object.entries(urlInfo.params).map(([key, value]) => (
              <p key={key} className="text-sm">
                <span className="font-semibold">{key}:</span> {value}
              </p>
            ))}
          </div>
          
          <div>
            <h3 className="font-semibold">Hash Parameters:</h3>
            <p className="text-sm font-mono bg-muted p-2 rounded">{urlInfo.hash || 'None'}</p>
            {Object.entries(urlInfo.hashParams).map(([key, value]) => (
              <p key={key} className="text-sm">
                <span className="font-semibold">{key}:</span> {value.length > 50 ? `${value.substring(0, 50)}...` : value}
              </p>
            ))}
          </div>
          
          <div>
            <h3 className="font-semibold">Auth Type Detection:</h3>
            <p className="text-sm">
              Type from search: {urlInfo.params.type || 'None'}
            </p>
            <p className="text-sm">
              Type from hash: {urlInfo.hashParams.type || 'None'}
            </p>
            <p className="text-sm">
              Has access_token: {urlInfo.hashParams.access_token ? 'Yes' : 'No'}
            </p>
            <p className="text-sm">
              Has refresh_token: {urlInfo.hashParams.refresh_token ? 'Yes' : 'No'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
