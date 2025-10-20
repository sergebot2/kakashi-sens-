const { config } = global.GoatBot;

module.exports = (code, text) => `
<body class="main full-padding" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;">
  <table class="wrapper"
    style="border-collapse: collapse;table-layout: fixed;min-width: 320px;width: 100%;background-color: #fff;"
    cellpadding="0" cellspacing="0" role="presentation">
    <tbody>
      <tr>
        <td>
          <div style="background-color: #f5f6f8;">
            <div class="layout one-col stack"
              style="margin: 0 auto;max-width: 600px;min-width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
              <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
                <div class="column"
                  style="text-align: left;color: #717a8a;font-size: 16px;line-height: 24px;font-family: sans-serif;">

                  <div style="margin: 24px 20px 0;"></div>

                  <div style="margin: 0 20px;">
                    <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                      <h2 style="margin: 0 0 16px;font-style: normal;font-weight: normal;color: #3d3b3d;font-size: 20px;line-height: 28px;text-align: center;">
                        Your Verification Code
                      </h2>
                      <h2 style="margin: 0 0 16px;font-style: normal;font-weight: normal;color: #3d3b3d;font-size: 20px;line-height: 28px;text-align: center;">
                        Mã xác thực này có hiệu lực trong ${config.dashBoard.expireVerifyCode / 60000} phút
                      </h2>
                    </div>
                  </div>

                  <div style="margin: 0 20px;">
                    <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                      <h3 style="margin: 0 0 12px;font-style: normal;font-weight: normal;color: #3d3b3d;font-size: 17px;line-height: 26px;text-align: center;">
                        ${text || 'Enter this verification code in the field:'}
                      </h3>
                    </div>
                  </div>

                  <div style="margin: 0 20px;">
                    <div style="display: block; width: 60%; margin: 30px auto; background-color: #ddd; border-radius: 40px; padding: 20px; text-align: center; font-size: 34px; letter-spacing: 10px;">
                      ${code}
                    </div>
                  </div>

                  <div style="margin: 0 20px;">
                    <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                      <h3 style="margin: 0 0 12px;font-style: normal;font-weight: normal;color: #3d3b3d;font-size: 17px;line-height: 26px;text-align: center;">
                        Nếu bạn không thực hiện hành động trên hãy bỏ qua email này
                      </h3>
                    </div>
                  </div>

                  <div style="margin: 0 20px 24px;">
                    <div style="padding-top: 8px; text-align: center">
                      <a href="#" style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #000;display: inline-block;">
                        <img style="border: 0;" src="https://i1.createsend1.com/static/eb/master/13-the-blueprint-3/images/socialmedia/facebook-brandcolor-medium-circle.png"
                          alt="Facebook" height="32" width="32">
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</body>
`;
