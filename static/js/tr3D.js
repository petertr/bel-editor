function Translate(v) {
    Er = '', i = 0, h = 1E-5;

    var ss, sss;
    v = v.replace(/#.*/gm, "");
    v = v.replace(/(\S+)\*\*(\S+)/g, "Math.pow($1,$2)");

    var reDomain = /^\s*Domain\s+(2D|3D|Ax)\b(\s+Symmetry\s+([^Ti]+))?\s*(Title\s+(.*))?/;
    var reImport = /^\s*Import\s+(.+)/;

    if (ss = v.match(reDomain)) {
        Space = ss[1];
        Symmetry = ss[3];
        Title = ss[5];
        Problem = 'Lapl2D';

        if (Space == '3D') {
            reExplicit3 = /^\s*Explicit\s+(x|y|z)\s*=(.+)\s+in\s+\((.+),(.+)\)\s*&\s*\((.+),(.+)\)(\s+ratio\s+(.+)|)\s+decomposition\s+(.+)\s+part\s+(\d+)/;

            reParametric3 = /^\s*Parametric\s+([^,]+),([^,]+),([^,]+)\s+in\s+\((.+),(.+)\)\s*&\s*\((.+),(.+)\)(\s+ratio\s+(.+)|)\s+decomposition\s+(.+)\s+part\s+(\d+)/;

            reLine3D = /^\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)(\s+\S+|)/;

            x1 = [];
            x2 = [];
            x3 = [];
            y1 = [];
            y2 = [];
            y3 = [];
            z1 = [];
            z2 = [];
            z3 = [];
            ib = [];


            return BuildBE3D(v);

        } else if (Space == '2D') {
            return BuildBE2D(v);
        }
    }



    function BuildBE2D(m) {
        var reSegment = /^\s*Segment\s+from\s+(.+)\s+to\s+(.+)\s+elements\s+(\S+)(\s+ratio\s+(\S+)|)\s+part\s+(\d+)/;
        var reArc = /^\s*Arc\s+center\s+(\S+)\s+radius\s+(\S+)\s+from\s+(\S+)\s+to\s+(\S+)\s+elements\s+(\S+)(\s+ratio\s+(\S+)|)\s+part\s+(\d+)/;
        var reExplicit2 = /^\s*Explicit\s+(.+?)\s+from\s+(.+?)\s+to\s+(.+?)\s+elements\s+(\S+)(\s+ratio\s+(.+)|)\s+part\s+(\d+)/;
        var reParametric2 = /^\s*Parametric\s+(.+)\s+from\s+(.+)\s+to\s+(.+)\s+elements\s+(\S+)(\s+ratio\s+(.+)|)\s+part\s+(\d+)/;
        var reLine2D = /^\s*((-?\d+\.\d*|-?\d+)(E(\+|-)?\d+)?)\s+((-?\d+\.\d*|-?\d+)(E(\+|-)?\d+)?)\s+((-?\d+\.\d*|-?\d+)(E(\+|-)?\d+)?)\s+((-?\d+\.\d*|-?\d+)(E(\+|-)?\d+)?)\s*(\b\d+)?","i/;
        var j, ss, sss, x1 = [],
            y1 = [],
            x2 = [],
            y2 = [],
            ib = [],
            d = '';
        var ss = m.split(/\r?\n/);

        for (i = 1; i < ss.length; i++) {
            if (sss = ss[i].match(reSegment)) {
                AddSegment(sss[1], sss[2], sss[3], sss[5] ? sss[5] : "1", sss[6]);
            } else if (sss = ss[i].match(reArc)) {
                AddArc(sss[1], sss[2], sss[3], sss[4], sss[5], sss[7] ? sss[7] : "1", sss[8]);
            } else if (sss = ss[i].match(reExplicit2)) {
                AddExplicit(sss[1], sss[2], sss[3], sss[4], sss[6] ? sss[6] : "1", sss[7]);
            } else if (sss = ss[i].match(reParametric2)) {
                AddParametric(sss[1], sss[2], sss[3], sss[4], sss[6] ? sss[6] : "1", sss[7]);
            } else if (sss = ss[i].match(reImport)) {
                AddImport2D(sss[1]);
            } else if (/^\s*$/.test(ss[i])) {
                continue;
            } else {
                Eval(ss[i]);
            }
        }

        if (Er == '') return d;
        else return Er;


        function AddSegment(From, To, N, ratio, Value) {
            var j, ss, X1, Y1, X2, Y2, t, d, x1i, x2i, y1i, y2i;

            if (ss = From.match(/\(([^,]+),([^\)]+)\)/)) {
                X1 = Eval(ss[1]);
                Y1 = Eval(ss[2])
            }

            if (ss = To.match(/\(([^,]+),([^\)]+)\)/)) {
                X2 = Eval(ss[1]);
                Y2 = Eval(ss[2])
            }
            N = Eval(N);

            ratio = Eval(ratio);

            if (Math.abs(ratio - 1) < 1e-2) {
                d = 1 / N;
                ratio = 1;
            } else {
                d = 1 / ((1 - Math.pow(ratio, N)) / (1 - ratio));
            }

            t = 0;

            for (j = 0; j < N; j++) {
                ib[ib.length] = Value;

                x1[x1.length] = x1i = X1 + (X2 - X1) * t;

                y1[y1.length] = y1i = Y1 + (Y2 - Y1) * t;

                t += d * Math.pow(ratio, j);

                x2[x2.length] = x2i = X1 + (X2 - X1) * t;

                y2[y2.length] = y2i = Y1 + (Y2 - Y1) * t;

                d += [x1i, y1i, x2i, y2i, Value].join("\t") + "\n";
            }
        }

        function AddArc(Center, Radius, From, To, N, ratio, Value) {
            var ss, j, t = 0,
                Rx, Ry, x1i, x2i, y1i, y2i;

            if (ss = Center.match(/\(([^,]+),([^\)]+)\)/)) {
                X0 = Eval(ss[1]);
                Y0 = Eval(ss[2])
            } else {
                Er += 'Bad center in line ' + i + '\n';
                return;
            }

            if (ss = Radius.match(/\(([^,]+),([^\)]+)\)|(.+)/)) {
                if (ss[3]) {
                    Rx = Ry = Eval(ss[3]);
                } else {
                    Rx = Eval(ss[1]);
                    Ry = Eval(ss[2])
                }
            } else {
                Er += 'Bad radius in line ' + i + '\n';
                return;
            }
            From = Eval(From);
            To = Eval(To);
            N = Eval(N);
            ratio = Eval(ratio);

            if (Math.abs(ratio - 1) < 1e-2) {
                de = 1 / N;
                ratio = 1;
            } else {
                de = 1 / ((1 - Math.pow(ratio, N)) / (1 - ratio));
            }

            t = 0;

            for (j = 0; j < N; j++) {
                ib[ib.length] = Value;

                x1[x1.length] = x1i = X0 + Rx * Math.cos(From + (To - From) * t);

                y1[y1.length] = y1i = Y0 + Ry * Math.sin(From + (To - From) * t);

                t += de * Math.pow(ratio, j);

                x2[x2.length] = x2i = X0 + Rx * Math.cos(From + (To - From) * t);

                y2[y2.length] = y2i = Y0 + Ry * Math.sin(From + (To - From) * t);

                d += [x1i, y1i, x2i, y2i, Value].join("\t") + "\n";
            }
        }

        function AddExplicit(F, From, To, N, ratio, Value) {
            var ss = F.split("=");

            if (ss.length != 2) {
                Er += 'Error: Bad formula in explicit, line ' + i + '\n';
            } else if (/^\s*x\s*$/.test(ss[0])) {
                AddParametric(ss[1].replace(/\by\b/g, "s") + ",s", From, To, N, ratio, Value);
            } else if (/^\s*y\s*$/.test(ss[0])) {
                AddParametric("s," + ss[1].replace(/\bx\b/g, "s"), From, To, N, ratio, Value);
            } else {
                Er += 'Error: Bad formula in explicit, line ' + i + '\n';
            }
        }

        function AddParametric(F, From, To, N, ratio, Value) {
            var j, ss, X1, Y1, X2, Y2, de, t;

            ss = F.split(",");

            if (ss.length != 2) {
                bb.writeln('<h2>Bad formula in parametric, line ', i, '</h2>');
                Er++;
                return;
            }

            N = Eval(N);
            ratio = Eval(ratio);
            s = Eval(From);
            t = Eval(To) - s;

            X1 = Eval(ss[0]);
            Y1 = Eval(ss[1]);

            if (Math.abs(ratio - 1) < 1e-2) {
                de = 1 / N;
                ratio = 1;
            } else {
                de = 1 / ((1 - Math.pow(ratio, N)) / (1 - ratio));
            }

            for (j = 0; j < N; j++) {
                ib[ib.length] = Value;
                x1[x1.length] = X1;
                y1[y1.length] = Y1;

                s += t * de * Math.pow(ratio, j);

                x2[x2.length] = X2 = Eval(ss[0]);

                y2[y2.length] = Y2 = Eval(ss[1]);

                d += [X1, Y1, X2, Y2, Value].join("\t") + "\n";

                X1 = X2;
                Y1 = Y2;
            }
        }

        function AddImport2D(f) {
            var j, ss, sss, s = ReadFile(f);

            if (s) {
                ss = s.replace(/BND3.*\n/, "").split(/\r*\n/);

                for (j = 0; j < ss.length; j++) {
                    sss = ss[j].split(/\s+/);

                    if (sss.length > 3 && sss.length < 6) {
                        x1[x1.length] = Number(sss[0]);
                        y1[y1.length] = Number(sss[1]);
                        x2[x2.length] = Number(sss[2]);
                        y2[y2.length] = Number(sss[3]);

                        if (sss.length == 5) {
                            ib[ib.length] = parseInt(sss[5]);
                            d += ss[j] + "\n";
                        } else {
                            ib[ib.length] = 0;
                            d += ss[j] + "\t0\n";
                        }
                    } else if (/^\s*$/.test(ss[j])) {
                        continue;
                    } else {
                        Er += 'Error: File ' + file + '  Bad  line:\n' + ss[j] + '';
                        return
                    }
                }
            } else {
                Er += 'Bad FileName ' + file + '  in line ', i, '\n';
            }

        }

    }

    function Eval(s) {
        with(Math) {
            var S, _e;

            try {
                S = eval(s)
            } catch (_e) {
                Er += 'Error: Eval error in line ' + (i + 1) + '\t' + s + '\n' + _e.message + '\n';
                return;
            }
            return S;
        }
    }

    function BuildBE3D(m) {
        var i, rez = '',
            sss, Er = '',
            d = '',
            x1 = [],
            y1 = [],
            z1 = [],
            x2 = [],
            y2 = [],
            z2 = [],
            x3 = [],
            y3 = [],
            z3 = [],
            ib = [];

        var ss = m.split(/\r?\n/),
            X1, X2, X3, X4, Y1, Y2, Y3, Y4, Z1, Z2, Z3, Z4;

        for (i = 1; i < ss.length; i++) {
            if (sss = ss[i].match(reExplicit3)) 
            {
                AddExplicit(sss[1], sss[2], sss[3], sss[4], sss[5], sss[6], sss[8], sss[9], sss[10]);
            }
            else if (sss = ss[i].match(reParametric3)) 
            {
                AddParametric(sss[1], sss[2], sss[3], sss[4], sss[5], sss[6], sss[7], sss[9], sss[10], sss[11]);
            }
            else if (sss = ss[i].match(reImport)) 
            {
                AddImport3D(sss[1]);
            }
            else if (/^\s*$/.test(ss[i])) 
            {
              continue;
            }
            else 
            {
                console.log( "This is free: " + ss[i]);
                Eval(ss[i]);
            }

        }
        if (Er == '') return "BND3 " + x1.length + "\n" + rez;
        else return Er;

        function AddExplicit(X, F, U1, U2, V1, V2, ratio, NM, V) {
            console.log("AddExplicit( " + " X: " + X + " F: " + F + " U1: " + U1 + " U2: " + U2 + " V1: " + V1 + " V2: " + V2 + " ratio: " + ratio + " NM: " + NM + " V: " + V + ") ");

            if (X == 'z') AddParametric("u", "v", F.replace(/\bx\b/g, 'u').replace(/\by\b/g, 'v'), U1, U2, V1.replace(/\bx\b/g, 'u'), V2.replace(/\bx\b/g, 'u'), ratio, NM, V);

            else if (X == 'y') AddParametric("u", F.replace(/\bx\b/g, 'u').replace(/\bz\b/g, 'v'), "v", U1, U2, V1.replace(/\bx\b/g, 'u'), V2.replace(/\bx\b/g, 'u'), ratio, NM, V);

            else if (X == 'x') AddParametric(F.replace(/\by\b/g, 'u').replace(/\bz\b/g, 'v'), "u", "v", U1, U2, V1.replace(/\by\b/g, 'u'), V2.replace(/\by\b/g, 'u'), ratio, NM, V);

            else Er += 'Error: Bad formula in explicit, line ' + i + '\n';

        }

        function AddParametric(X, Y, Z, U1, U2, V1, V2, ratio, NM, V) {

            console.log("AddParametric( " + " X: " + X + " Y: " + Y + " Z: " + Z + " U1: " + U1 + " U2: " + U2 + " V1: " + V1 + " V2: " + V2 + " ratio: " + ratio + " NM: " + NM + " V: " + V + " ) ");

            var r = [],
                N = [],
                d = [],
                k, l, u, u1, v, v1, N, r, 
                dX1du, dY1du, dZ1du, dX1dv, dY1dv, dZ1dv, 
                dX2du, dY2du, dZ2du, dX2dv, dY2dv, dZ2dv, 
                dX3du, dY3du, dZ3du, dX3dv, dY3dv, dZ3dv, 
                dX4du, dY4du, dZ4du, dX4dv, dY4dv, dZ4dv, 
                n1x, n1y, n1z, n2x, n2y, n2z, n3x, n3y, 
                n3z, n4x, n4y, n4z;

            var FX = new Function('u', 'v', "with(Math){try{return " + X + "}catch(_e){Er+='Error: Eval error in line '+(i+1)+'\\n'+_e.message;}}return 0; ");

            var FY = new Function('u', 'v', "with(Math){try{return " + Y + "}catch(_e){Er+='Error: Eval error in line '+(i+1)+'\\n'+_e.message;}}return 0; ");

            var FZ = new Function('u', 'v', "with(Math){try{return " + Z + "}catch(_e){Er+='Error: Eval error in line '+(i+1)+'\\n'+_e.message;}}return 0; ");

            var dFdu = new Function('u', 'v', 'F', "return (F(u+h,v)-F(u-h,v))/(h+h)");

            var dFdv = new Function('u', 'v', 'F', "return (F(u,v+h)-F(u,v-h))/(h+h)");

            console.log(X, FX, ' Fx=', FX(1, 1), FY, FY(1, 2), FZ, FZ(1, 1));

            if (ratio) {
                r = ratio.replace(/^\(?(.*)\)$/, "$1").split(",");
                if (r.length == 1) r[1] = r[0];
                r[0] = Eval(r[0]);
                r[1] = Eval(r[1]);
            } else r = [1, 1];

            if (NM) {
                N = NM.replace(/^\(?(.*)\)$/, "$1").split(",");
                if(N.length == 1) 
                {
                    N[1] = N[0];
                }
                N[0] = Eval(N[0]);
                N[1] = Eval(N[1]);
            } else N = [10, 10];

            for (k = 0; k < 2; k++)
            {
                if (Math.abs(r[k] - 1) < 1e-2) {
                    d[k] = 1 / N[k];
                    r[k] = 1;
                } else d[k] = 1 / ((1 - Math.pow(r[k], N[k])) / (1 - (r[k])));
            }

            u = Eval(U1);

            for (k = 0; k < N[0]; k++) 
            {
                u1 = u + d[0] * Math.pow(r[0], k);

                v = Eval(V1);

                for (l = 0; l < N[1]; l++) 
                {
                    v1 = v + d[1] * Math.pow(r[1], l);

                    X1 = FX(u, v);
                    Y1 = FY(u, v);
                    Z1 = FZ(u, v);

                    dX1du = dFdu(u, v, FX);
                    dY1du = dFdu(u, v, FY);
                    dZ1du = dFdu(u, v, FZ);
                    dX1dv = dFdv(u, v, FX);
                    dY1dv = dFdv(u, v, FY);
                    dZ1dv = dFdv(u, v, FZ);

                    n1x = dY1du * dZ1dv - dZ1du * dY1dv;
                    n1y = dZ1du * dX1dv - dX1du * dZ1dv;
                    n1z = dX1du * dY1dv - dY1du * dX1dv;

                    sl = Math.sqrt(n1x * n1x + n1y * n1y + n1z * n1z);
                    if (Math.abs(sl) > 1E-4) n1x /= sl, n1y /= sl, n1z /= sl;

                    X2 = FX(u1, v);
                    Y2 = FY(u1, v);
                    Z2 = FZ(u1, v);

                    dX2du = dFdu(u, v, FX);
                    dY2du = dFdu(u, v, FY);
                    dZ2du = dFdu(u, v, FZ);
                    dX2dv = dFdv(u, v, FX);
                    dY2dv = dFdv(u, v, FY);
                    dZ2dv = dFdv(u, v, FZ);

                    n2x = dY2du * dZ2dv - dZ2du * dY2dv;
                    n2y = dZ2du * dX2dv - dX2du * dZ2dv;
                    n2z = dX2du * dY2dv - dY2du * dX2dv;

                    sl = Math.sqrt(n2x * n2x + n2y * n2y + n2z * n2z);
                    if (Math.abs(sl) > 2E-4) n2x /= sl, n2y /= sl, n2z /= sl;

                    X3 = FX(u1, v1);
                    Y3 = FY(u1, v1);
                    Z3 = FZ(u1, v1);

                    dX3du = dFdu(u, v, FX);
                    dY3du = dFdu(u, v, FY);
                    dZ3du = dFdu(u, v, FZ);
                    dX3dv = dFdv(u, v, FX);
                    dY3dv = dFdv(u, v, FY);
                    dZ3dv = dFdv(u, v, FZ);

                    n3x = dY3du * dZ3dv - dZ3du * dY3dv;
                    n3y = dZ3du * dX3dv - dX3du * dZ3dv;
                    n3z = dX3du * dY3dv - dY3du * dX3dv;

                    sl = Math.sqrt(n3x * n3x + n3y * n3y + n3z * n3z);
                    if (Math.abs(sl) > 3E-4) n3x /= sl, n3y /= sl, n3z /= sl;

                    X4 = FX(u, v1);
                    Y4 = FY(u, v1);
                    Z4 = FZ(u, v1);

                    dX4du = dFdu(u, v, FX);
                    dY4du = dFdu(u, v, FY);
                    dZ4du = dFdu(u, v, FZ);
                    dX4dv = dFdv(u, v, FX);
                    dY4dv = dFdv(u, v, FY);
                    dZ4dv = dFdv(u, v, FZ);

                    n4x = dY4du * dZ4dv - dZ4du * dY4dv;
                    n4y = dZ4du * dX4dv - dX4du * dZ4dv;
                    n4z = dX4du * dY4dv - dY4du * dX4dv;

                    sl = Math.sqrt(n4x * n4x + n4y * n4y + n4z * n4z);
                    if (Math.abs(sl) > 4E-4) n4x /= sl, n4y /= sl, n4z /= sl;

                    if (Math.pow(X3 - X1, 2) + Math.pow(Y3 - Y1, 2) + Math.pow(Z3 - Z1, 2) < 1.01 * (Math.pow(X4 - X2, 2) + Math.pow(Y4 - Y2, 2) + Math.pow(Z4 - Z2, 2))) 
                    {
                        x1[x1.length] = X1;
                        x2[x2.length] = X2;
                        x3[x3.length] = X3;
                        dXdu = (dX1du + dX2du + dX3du) / 3;
                        dXdv = (dX1dv + dX2dv + dX3dv) / 3;

                        y1[y1.length] = Y1;
                        y2[y2.length] = Y2;
                        y3[y3.length] = Y3;
                        dYdu = (dY1du + dY2du + dY3du) / 3;
                        dYdv = (dY1dv + dY2dv + dY3dv) / 3;

                        z1[z1.length] = Z1;
                        z2[z2.length] = Z2;
                        z3[z3.length] = Z3;
                        dZdu = (dZ1du + dZ2du + dZ3du) / 3;
                        dZdv = (dZ1dv + dZ2dv + dZ3dv) / 3;

                        rez += [X1, Y1, Z1, X2, Y2, Z2, X3, Y3, Z3, V, dXdu, dYdu, dZdu, dXdv, dYdv, dZdv, ].join("\t") + "\n";

                        x1[x1.length] = X1;
                        x2[x2.length] = X3;
                        x3[x3.length] = X4;
                        dXdu = (dX1du + dX3du + dX4du) / 3;
                        dXdv = (dX1dv + dX3dv + dX4dv) / 3;

                        y1[y1.length] = Y1;
                        y2[y2.length] = Y3;
                        y3[y3.length] = Y4;
                        dYdu = (dY1du + dY3du + dY4du) / 3;
                        dYdv = (dY1dv + dY3dv + dY4dv) / 3;

                        z1[z1.length] = Z1;
                        z2[z2.length] = Z3;
                        z3[z3.length] = Z4;
                        dZdu = (dZ1du + dZ3du + dZ4du) / 3;
                        dZdv = (dZ1dv + dZ3dv + dZ4dv) / 3;

                        rez += [X1, Y1, Z1, X3, Y3, Z3, X4, Y4, Z4, V, dXdu, dYdu, dZdu, dXdv, dYdv, dZdv].join("\t") + "\n";


                    } 
                    else 
                    {
                        x1[x1.length] = X1;
                        x2[x2.length] = X2;
                        x3[x3.length] = X4;
                        dXdu = (dX1du + dX2du + dX4du) / 3;
                        dXdv = (dX1dv + dX2dv + dX4dv) / 3;

                        y1[y1.length] = Y1;
                        y2[y2.length] = Y2;
                        y3[y3.length] = Y4;
                        dYdu = (dY1du + dY2du + dY4du) / 3;
                        dYdv = (dY1dv + dY2dv + dY4dv) / 3;

                        z1[z1.length] = Z1;
                        z2[z2.length] = Z2;
                        z3[z3.length] = Z4;
                        dZdu = (dZ1du + dZ2du + dZ4du) / 3;
                        dZdv = (dZ1dv + dZ2dv + dZ4dv) / 3;

                        rez += [X1, Y1, Z1, X2, Y2, Z2, X4, Y4, Z4, V, dXdu, dYdu, dZdu, dXdv, dYdv, dZdv].join("\t") + "\n";

                        x1[x1.length] = X2;
                        x2[x2.length] = X3;
                        x3[x3.length] = X4;
                        dXdu = (dX2du + dX3du + dX4du) / 3;
                        dXdv = (dX2dv + dX3dv + dX4dv) / 3;

                        y1[y1.length] = Y2;
                        y2[y2.length] = Y3;
                        y3[y3.length] = Y4;
                        dYdu = (dY2du + dY3du + dY4du) / 3;
                        dYdv = (dY2dv + dY3dv + dY4dv) / 3;

                        z1[z1.length] = Z2;
                        z2[z2.length] = Z3;
                        z3[z3.length] = Z4;
                        dZdu = (dZ2du + dZ3du + dZ4du) / 3;
                        dZdv = (dZ2dv + dZ3dv + dZ4dv) / 3;

                        rez += [X2, Y2, Z2, X3, Y3, Z3, X4, Y4, Z4, V, dXdu, dYdu, dZdu, dXdv, dYdv, dZdv].join("\t") + "\n";

                    }
                    ib[ib.length] = V;
                    ib[ib.length] = V;

                    v = v1;
                }
                u = u1;
            }
        }

        function AddImport3D(f) {
            var j, ss, sss, s = parent.ReadFile(f),
                n = 1;

            if (s) {
                ss = s.replace(/BND3.*\n/, "").split(/\r*\n/);

                for (j = 0; j < ss.length; j++) {
                    sss = ss[j].split(/\s+/);

                    if (sss.length > 8 && sss.length < 11) {
                        x1[x1.length] = Number(sss[0]);
                        y1[y1.length] = Number(sss[1]);
                        z1[z1.length] = Number(sss[2]);

                        x2[x2.length] = Number(sss[3]);
                        y2[y2.length] = Number(sss[4]);
                        z2[z2.length] = Number(sss[5]);

                        x3[x3.length] = Number(sss[6]);
                        y3[y3.length] = Number(sss[7]);
                        z3[z3.length] = Number(sss[8]);

                        if (sss.length == 10) {
                            ib[ib.length] = parseInt(sss[10]);

                            d += ss[j] + "\n";

                        } else {
                            ib[ib.length] = 0;

                            d += ss[j] + "\t0\n";

                        }
                    } else if (/^\s*$/.test(ss[j])) continue;

                    else {
                        Er += 'Error: File ' + file + '  Bad  line:\n' + ss[j] + '';
                        return
                    }
                }
            } else Er += 'Bad FileName ' + file + '  in line ' + i + '\n';

        }
    }
}


//   try
//   {
//     print=console.log;

//     fn=process.argv[2];

//     print(fn);

//     fs=require('fs');

//     s=fs.readFileSync(fn,'utf8');

//     print(s)
//   }
//   catch(_e)
//   {
//     WriteFile=function(FileName,FileContents) 
//     {
//     var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

//     file.initWithPath( FileName );

//     if ( !file.exists() ) file.create( Components.interfaces.nsIFile.NORMALFILETYPE, 420 );

//     var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance( Components.interfaces.nsIFileOutputStream );

//     outputStream.init( file, 0x04 | 0x08 | 0x20, 420, 0 );

//     var result = outputStream.write( FileContents, FileContents.length );

//     outputStream.close();
//     } 

//   ReadFile=function(FileName) {
//   var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

//   file.initWithPath( FileName );

//   if ( !file.exists() ) return null;

//   var is = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance( Components.interfaces.nsIFileInputStream );

//   is.init( file,0x01, 00004, null);

//   var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance( Components.interfaces.nsIScriptableInputStream );

//   sis.init( is );

//   return sis.read( sis.available() );

//   }

//   fn=arguments[0];

//   s=ReadFile(fn);


// }



/*

try{
  FS=new ActiveXObject("Scripting.FileSystemObject");
  
  fn=WScript.Arguments(0);
  
  WScript.Echo(Translate(ReadFile(fn)));
  
 
 function ReadFile(fname){var ss="";
 if(FS.FileExists(fname)){try{var IN = FS.OpenTextFile(fname,1);
 var ss = IN.ReadAll();
 IN.Close();
 }catch(e){}}else{WScript.Echo("File "+fname+" is absent");
 WScript.Quit(3);
 } return ss}
 function WriteFile(fname,fcontents){if(fname==""||fcontents=="") return;
 try{var OUT=FS.OpenTextFile(fname,2,true);
 if(OUT){OUT.Write(fcontents);
  OUT.Close()}}catch(e){OUT=false}}
 WScript.Quit();
 
}catch(e){}

try{
 print=console.log;
 
 fn=process.argv[2];
 
 fs = require('fs');
 
 console.log(s=fs.readFileSync(fn,'utf8'));
 
 s=Translate(s);
 
 console.log("s="+s);
 
}catch(e){}

*/
